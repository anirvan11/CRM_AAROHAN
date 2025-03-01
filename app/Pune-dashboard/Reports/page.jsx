'use client';
import React, { useEffect, useState } from 'react';
import NavBar from '../NavBar/NavBar';
import { db, auth } from '../../firebase/config';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { Group as GroupIcon } from '@mui/icons-material';
import { ArrowDropUp as ArrowUpIcon, ArrowDropDown as ArrowDownIcon } from '@mui/icons-material';
import RevenueChart from '@/app/components/RevenueChart';

const Reports = () => {
    const [totalEnquiries, setTotalEnquiries] = useState(0);
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


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchMonthlyReports(user.uid); // Fetch reports only when user is available
            }
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    const fetchMonthlyReports = async (currentUserUID) => {
        try {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth(); // 0-based index
            const currentYear = currentDate.getFullYear();
            const isLastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate() === currentDate.getDate();

            // Fetch only customers allocated to the current user
            const customersRef = query(
                collection(db, 'Customers'),
                where('Allocation', '==', currentUserUID)
            );
            const customersSnapshot = await getDocs(customersRef);

            let allocatedEnquiries = [];
            let totalPaid = 0, advancePaid = 0, yetToPay = 0;
            let won = 0, lost = 0, dead = 0; // New counters

            customersSnapshot.forEach((doc) => {
                const enquiryData = doc.data();
                const createdAt = enquiryData?.createdAt?.toDate();

                if (createdAt) {
                    const createdMonth = createdAt.getMonth();
                    const createdYear = createdAt.getFullYear();

                    if (createdMonth === currentMonth && createdYear === currentYear) {
                        allocatedEnquiries.push(enquiryData);

                        // Calculate payment summary
                        const quotation = enquiryData?.Quotation || {};
                        totalPaid += quotation.Total || 0;
                        advancePaid += quotation.Paid || 0;
                        yetToPay += quotation.Left || 0;

                        // Count customers based on status
                        switch (enquiryData?.Status) {
                            case 'Won':
                                won++;
                                break;
                            case 'Lost':
                                lost++;
                                break;
                            case 'Dead':
                                dead++;
                                break;
                            default:
                                break;
                        }
                    }
                }
            });

            // Compute the current month's open and total enquiries
            let currentTotal = allocatedEnquiries.length;
            let openCount = allocatedEnquiries.filter((enquiry) =>
                ['Verified', 'Pending'].includes(enquiry?.Status)
            ).length;

            // Fetch previous month's report
            const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

            const previousReportQuery = query(
                collection(db, 'saveMonthlyReport'),
                where('month', '==', previousMonth + 1), // Firestore months are 1-based
                where('year', '==', previousYear),
                where('uid', '==', currentUserUID) // Only fetch the current user's reports
            );
            const previousReportSnapshot = await getDocs(previousReportQuery);

            let carryForwardOpen = 0;
            if (!previousReportSnapshot.empty) {
                const previousReport = previousReportSnapshot.docs[0].data();
                carryForwardOpen = previousReport.openEnquiries || 0;

                // Set previous month values
                setPreviousTotalEnquiries(previousReport.totalEnquiries || 0);
                setPreviousOpenEnquiries(previousReport.openEnquiries || 0);
            }

            // Add carry-forward open enquiries to current month ONLY IF they are still "open"
            currentTotal += carryForwardOpen;
            openCount += carryForwardOpen;

            // Update state
            setTotalEnquiries(currentTotal);
            setOpenEnquiries(openCount);

            // Set financial data
            setFinancialSummary({ totalPaid, advancePaid, yetToPay });
            // Set new status counts
            setWonCount(won);
            setLostCount(lost);
            setDeadCount(dead);

            // Save the current report only if today is the last day of the month
            if (isLastDayOfMonth) {
                const currentDocId = `${currentYear}-${currentMonth + 1}`;
                const currentReportRef = doc(db, 'saveMonthlyReport', currentDocId);

                await setDoc(currentReportRef, {
                    month: currentMonth + 1,
                    year: currentYear,
                    totalEnquiries: currentTotal,
                    openEnquiries: openCount,
                    totalPaid,
                    advancePaid,
                    yetToPay,
                    wonCount: won,
                    lostCount: lost,
                    deadCount: dead,
                    uid: currentUserUID
                });

                console.log('Monthly report saved:', {
                    currentDocId,
                    currentTotal,
                    openCount,
                    totalPaid,
                    advancePaid,
                    yetToPay,
                    won,
                    lost,
                    dead
                });
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const totalPercentageChange = previousTotalEnquiries
        ? ((totalEnquiries - previousTotalEnquiries) / previousTotalEnquiries) * 100
        : 0;

    const openPercentageChange = previousOpenEnquiries
        ? ((previousOpenEnquiries - openEnquiries) / previousOpenEnquiries) * 100
        : 0;

    return (
        <div className="h-screen w-full bg-white overflow-auto relative">
            <NavBar />
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-black mb-4">Reports</h1>

                {/* Enquiries Cards */}
                <div className="flex space-x-6 mb-6">
                    {/* Total Enquiries */}
                    <div className="flex items-center bg-green-100 rounded-lg shadow-md p-4 w-64">
                        <GroupIcon className="text-green-600 text-3xl mr-4" />
                        <div>
                            <p className="text-sm text-gray-600">Total Enquiries</p>
                            <p className="text-2xl font-bold text-black">{totalEnquiries}</p>
                            <p
                                className={`text-xs flex items-center ${
                                    totalPercentageChange >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}
                            >
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
                            <p
                                className={`text-xs flex items-center ${
                                    openPercentageChange >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}
                            >
                                {openPercentageChange >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                {Math.abs(openPercentageChange.toFixed(2))}% this month
                            </p>
                        </div>
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
                {/* Financial Summary and Revenue Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Financial Summary */}
                    <div className="bg-gray-100 rounded-lg shadow-md p-4">
                        <h2 className="text-lg font-semibold text-black mb-2">30 Days Summary</h2>
                        <div className="text-sm text-gray-600">
                            <p className="flex justify-between">
                                <span>Total Paid:</span>
                                <span className="font-bold text-black">
                                    {financialSummary.totalPaid.toLocaleString()}
                                </span>
                            </p>
                            <p className="flex justify-between">
                                <span>Advance Paid:</span>
                                <span className="font-bold text-black">
                                    {financialSummary.advancePaid.toLocaleString()}
                                </span>
                            </p>
                            <p className="flex justify-between">
                                <span>Yet to Pay:</span>
                                <span className="font-bold text-black">
                                    {financialSummary.yetToPay.toLocaleString()}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Revenue Chart */}
                    <RevenueChart />
                </div>
            </div>
        </div>
    );
};

export default Reports;
