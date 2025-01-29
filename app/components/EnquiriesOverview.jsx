'use client';
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/config';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { Group as GroupIcon } from '@mui/icons-material';
import { ArrowDropUp as ArrowUpIcon, ArrowDropDown as ArrowDownIcon } from '@mui/icons-material';


const EnquiriesOverview = () => {
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
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchMonthlyEnquiriesOverview(user.uid); // Fetch EnquiriesOverview only when user is available
            }
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    const fetchMonthlyEnquiriesOverview = async (currentUserUID) => {
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
                    }
                }
            });

            // Compute the current month's open and total enquiries
            let currentTotal = allocatedEnquiries.length;
            let openCount = allocatedEnquiries.filter((enquiry) =>
                ['Verified', 'Pending', 'In-progress'].includes(enquiry?.Status)
            ).length;

            // Fetch previous month's report
            const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

            const previousReportQuery = query(
                collection(db, 'saveMonthlyReport'),
                where('month', '==', previousMonth + 1), // Firestore months are 1-based
                where('year', '==', previousYear),
                where('uid', '==', currentUserUID) // Only fetch the current user's EnquiriesOverview
            );
            const previousEnquiriesOverviewnapshot = await getDocs(previousReportQuery);

            let carryForwardOpen = 0;
            if (!previousEnquiriesOverviewnapshot.empty) {
                const previousReport = previousEnquiriesOverviewnapshot.docs[0].data();
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
                    uid: currentUserUID
                });

                console.log('Monthly report saved:', {
                    currentDocId,
                    currentTotal,
                    openCount,
                    totalPaid,
                    advancePaid,
                    yetToPay,
                });
            }
        } catch (error) {
            console.error('Error fetching EnquiriesOverview:', error);
        }
    };

    const totalPercentageChange = previousTotalEnquiries
        ? ((totalEnquiries - previousTotalEnquiries) / previousTotalEnquiries) * 100
        : 0;

    const openPercentageChange = previousOpenEnquiries
        ? ((previousOpenEnquiries - openEnquiries) / previousOpenEnquiries) * 100
        : 0;

    return (
        <div className="p-4 bg-stone-200 rounded-lg shadow-lg z-[-1]">
            <div className="p-6">

                {/* Enquiries Cards */}
                <div className="flex space-x-6 mb-6">
                    {/* Total Enquiries */}
                    <div className="flex items-center bg-green-100 rounded-lg shadow-md p-4 w-64">
                        <GroupIcon className="text-green-600 text-2xl mr-4" />
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
                        <GroupIcon className="text-red-600 text-2xl mr-4" />
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

            </div>
        </div>
    );
};

export default EnquiriesOverview;
