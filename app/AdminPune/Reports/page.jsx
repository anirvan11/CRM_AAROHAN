'use client';
import React, { useEffect, useState } from 'react';
import AdminNav from '../AdminNavBar/AdminNav';
import { db } from '../../firebase/config';
import { collection, getDocs, doc, setDoc,getDoc,serverTimestamp } from 'firebase/firestore';
import { Group as GroupIcon } from '@mui/icons-material';
import { ArrowDropUp as ArrowUpIcon, ArrowDropDown as ArrowDownIcon } from '@mui/icons-material';
import AdminRevenueChart from '@/app/components/AdminRevenueChart';

const AdminReports = () => {
    const [totalEnquiries, setTotalEnquiries] = useState(0);
    const [openEnquiries, setOpenEnquiries] = useState(0);
    const [previousTotalEnquiries, setPreviousTotalEnquiries] = useState(0);
    const [previousOpenEnquiries, setPreviousOpenEnquiries] = useState(0);
    const [financialSummary, setFinancialSummary] = useState({
        totalPaid: 0,
        advancePaid: 0,
        yetToPay: 0,
    });

    useEffect(() => {
        fetchAdminMonthlyReports();
    }, []);

    const fetchAdminMonthlyReports = async () => {
        try {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            const isLastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate() === currentDate.getDate();
    
            // Fetch all customer enquiries for the current month
            const customersSnapshot = await getDocs(collection(db, 'Customers'));
    
            let allEnquiries = [];
            let totalPaid = 0, advancePaid = 0, yetToPay = 0;
    
            customersSnapshot.forEach((doc) => {
                const enquiryData = doc.data();
                const createdAt = enquiryData?.createdAt?.toDate();
    
                if (createdAt) {
                    const createdMonth = createdAt.getMonth();
                    const createdYear = createdAt.getFullYear();
    
                    if (createdMonth === currentMonth && createdYear === currentYear) {
                        allEnquiries.push(enquiryData);
    
                        // Calculate payment summary
                        const quotation = enquiryData?.Quotation || {};
                        totalPaid += quotation.Total || 0;
                        advancePaid += quotation.Paid || 0;
                        yetToPay += quotation.Left || 0;
                    }
                }
            });
    
            let currentTotal = allEnquiries.length;
            let openCount = allEnquiries.filter((enquiry) =>
                ['Verified', 'Pending', 'In-progress'].includes(enquiry?.Status)
            ).length;
    
            // Fetch previous month's report from saveMonthlyReport
            const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const previousMonthId = `${previousYear}-${previousMonth + 1}`;
    
            const previousReportDoc = await getDoc(doc(db, 'saveMonthlyReport', previousMonthId));
    
            let carryForwardOpen = 0;
            if (previousReportDoc.exists()) {
                const previousData = previousReportDoc.data();
                carryForwardOpen = previousData.openEnquiries || 0;
            }
    
            // Add previous month's open enquiries to both totalEnquiries and openEnquiries
            let finalTotalEnquiries = currentTotal + carryForwardOpen;
            let finalOpenEnquiries = openCount + carryForwardOpen;
    
            setTotalEnquiries(finalTotalEnquiries);
            setOpenEnquiries(finalOpenEnquiries);
            setFinancialSummary({ totalPaid, advancePaid, yetToPay });
    
            // Save the report only on the last day of the month
            if (isLastDayOfMonth) {
                const currentDocId = `${currentYear}-${currentMonth + 1}`;
                await setDoc(doc(db, 'adminMonthlyReports', currentDocId), {
                    year: currentYear,
                    month: currentMonth + 1,
                    totalEnquiries: finalTotalEnquiries, // Includes carryforward count
                    openEnquiries: finalOpenEnquiries,  // Includes carryforward count
                    totalPaid,
                    advancePaid,
                    yetToPay,
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

                {/* Enquiries Cards */}
                <div className="flex space-x-6 mb-6">
                    {/* Total Enquiries */}
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

                    {/* Open Enquiries */}
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
                    {/* Financial Summary */}
                    <div className="bg-gray-100 rounded-lg shadow-md p-4">
                        <h2 className="text-lg font-semibold text-black mb-2">30 Days Summary</h2>
                        <div className="text-sm text-gray-600">
                            <p className="flex justify-between"><span>Total Paid:</span><span className="font-bold text-black">{financialSummary.totalPaid.toLocaleString()}</span></p>
                            <p className="flex justify-between"><span>Advance Paid:</span><span className="font-bold text-black">{financialSummary.advancePaid.toLocaleString()}</span></p>
                            <p className="flex justify-between"><span>Yet to Pay:</span><span className="font-bold text-black">{financialSummary.yetToPay.toLocaleString()}</span></p>
                        </div>
                    </div>

                    {/* Revenue Chart */}
                    <AdminRevenueChart />
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
