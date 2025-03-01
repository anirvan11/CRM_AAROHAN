'use client';
import React, { useEffect, useState } from 'react';
import AdminNav from '../AdminNavBar/AdminNav';
import { db } from '../../firebase/config';
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";
import { Group as GroupIcon } from '@mui/icons-material';
import { ArrowDropUp as ArrowUpIcon, ArrowDropDown as ArrowDownIcon } from '@mui/icons-material';
import AdminRevenueChart from '@/app/components/AdminRevenueChart';

const branches = [
    { value: "North", label: "3s Sales Corporation" },
    { value: "North2", label: "3s Enterprises" },
    { value: "Pune", label: "Aarohan" }
];

const AdminReports = () => {
    const [totalEnquiries, setTotalEnquiries] = useState(0);
    const [selectedBranch, setSelectedBranch] = useState(branches[0].value);
    const [openEnquiries, setOpenEnquiries] = useState(0);
    const [previousTotalEnquiries, setPreviousTotalEnquiries] = useState(0);
    const [previousOpenEnquiries, setPreviousOpenEnquiries] = useState(0);
    const [financialSummary, setFinancialSummary] = useState({
        totalPaid: 0,
        advancePaid: 0,
        yetToPay: 0,
    });
    const [wonCount, setWonCount] = useState(0);
    const [lostCount, setLostCount] = useState(0);
    const [deadCount, setDeadCount] = useState(0);

    // Fetch admin reports when branch changes
    useEffect(() => {
        if (selectedBranch) {
            fetchAdminMonthlyReports();
        }
    }, [selectedBranch]);

    const fetchAdminMonthlyReports = async () => {
        try {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            const isLastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate() === currentDate.getDate();

            const customersSnapshot = await getDocs(
                query(collection(db, "Customers"), where("Branch", "==", selectedBranch))
            );

            let allEnquiries = [];
            let totalPaid = 0, advancePaid = 0, yetToPay = 0;
            let won = 0, lost = 0, dead = 0;

            customersSnapshot.forEach((doc) => {
                const enquiryData = doc.data();
                const createdAt = enquiryData?.createdAt?.toDate();

                if (createdAt) {
                    const createdMonth = createdAt.getMonth();
                    const createdYear = createdAt.getFullYear();

                    if (createdMonth === currentMonth && createdYear === currentYear) {
                        allEnquiries.push(enquiryData);
                        const quotation = enquiryData?.Quotation || {};
                        totalPaid += quotation.Total || 0;
                        advancePaid += quotation.Paid || 0;
                        yetToPay += quotation.Left || 0;

                        switch (enquiryData?.Status) {
                            case 'Won': won++; break;
                            case 'Lost': lost++; break;
                            case 'Dead': dead++; break;
                            default: break;
                        }
                    }
                }
            });

            let currentTotal = allEnquiries.length;
            let openCount = allEnquiries.filter((enquiry) =>
                ['Verified', 'Pending'].includes(enquiry?.Status)
            ).length;

            setTotalEnquiries(currentTotal);
            setOpenEnquiries(openCount);
            setFinancialSummary({ totalPaid, advancePaid, yetToPay });
            setWonCount(won);
            setLostCount(lost);
            setDeadCount(dead);

            if (isLastDayOfMonth) {
                const currentDocId = `${currentYear}-${currentMonth + 1}`;
                await setDoc(doc(db, 'adminMonthlyReports', currentDocId), {
                    year: currentYear,
                    month: currentMonth + 1,
                    totalEnquiries: currentTotal,
                    openEnquiries: openCount,
                    totalPaid,
                    advancePaid,
                    yetToPay,
                    wonCount: won,
                    lostCount: lost,
                    deadCount: dead,
                    timestamp: serverTimestamp(),
                }, { merge: true });
            }
        } catch (error) {
            console.error('Error fetching admin monthly reports:', error);
        }
    };
    const totalPercentageChange = previousTotalEnquiries
    ? ((totalEnquiries - previousTotalEnquiries) / previousTotalEnquiries) * 100
    : 0;

const openPercentageChange = previousOpenEnquiries
    ? ((previousOpenEnquiries - openEnquiries) / previousOpenEnquiries) * 100
    : 0;

    return (
        <div className="h-screen w-full bg-white overflow-hidden relative">
            <AdminNav />
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-black mb-4">Admin Reports</h1>

                {/* Branch Selector */}
                <div className="mb-6">
                    <label className="block text-black font-semibold mb-2">Select Branch</label>
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg bg-white w-64 text-black"
                    >
                        {branches.map((branch) => (
                            <option key={branch.value} value={branch.value}>
                                {branch.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Enquiries Cards */}
                <div className="flex space-x-6 mb-6">
                    <div className="flex items-center bg-green-100 rounded-lg shadow-md p-4 w-64">
                        <GroupIcon className="text-green-600 text-3xl mr-4" />
                        <div>
                            <p className="text-sm text-gray-600">Total Enquiries</p>
                            <p className="text-2xl font-bold text-black">{totalEnquiries}</p>
                            <p className={`text-xs flex items-center ${totalPercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {totalPercentageChange >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                {Math.abs(totalPercentageChange.toFixed(2))}% this month
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center bg-red-100 rounded-lg shadow-md p-4 w-64">
                        <GroupIcon className="text-red-600 text-3xl mr-4" />
                        <div>
                            <p className="text-sm text-gray-600">Open Enquiries</p>
                            <p className="text-2xl font-bold text-black">{openEnquiries}</p>
                            <p className={`text-xs flex items-center ${openPercentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {openPercentageChange >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                {Math.abs(openPercentageChange.toFixed(2))}% this month
                            </p>
                        </div>
                    </div>
                </div>


                {/* Financial Summary and Revenue Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-100 rounded-lg shadow-md p-4">
                        <h2 className="text-lg font-semibold text-black mb-2">30 Days Summary</h2>
                        <div className="text-sm text-gray-600">
                            <p className="flex justify-between"><span>Total Paid:</span><span className="font-bold text-black">{financialSummary.totalPaid.toLocaleString()}</span></p>
                            <p className="flex justify-between"><span>Advance Paid:</span><span className="font-bold text-black">{financialSummary.advancePaid.toLocaleString()}</span></p>
                            <p className="flex justify-between"><span>Yet to Pay:</span><span className="font-bold text-black">{financialSummary.yetToPay.toLocaleString()}</span></p>
                        </div>
                    </div>

                    {/* Customer Status Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-green-100 rounded-lg shadow-md p-4">
                            <h2 className="text-lg font-semibold text-black">Won Leads</h2>
                            <p className="text-2xl font-bold text-black">{wonCount}</p>
                        </div>
                        <div className="bg-gray-100 rounded-lg shadow-md p-4">
                            <h2 className="text-lg font-semibold text-black">Lost Leads</h2>
                            <p className="text-2xl font-bold text-black">{lostCount}</p>
                        </div>
                        <div className="bg-red-200 rounded-lg shadow-md p-4">
                            <h2 className="text-lg font-semibold text-black">Dead Leads</h2>
                            <p className="text-2xl font-bold text-black">{deadCount}</p>
                        </div>
                    </div>

                    <AdminRevenueChart />
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
