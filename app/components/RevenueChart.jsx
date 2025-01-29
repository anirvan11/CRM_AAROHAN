'use client';
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = () => {
    const [revenueData, setRevenueData] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchRevenueData(user.uid);
            }
        });

        return () => unsubscribe(); // Cleanup auth listener on unmount
    }, []);

    const fetchRevenueData = async (currentUserUID) => {
        try {
            console.log("Fetching revenue for user:", currentUserUID);

            // Query only reports for the logged-in user
            const reportsQuery = query(
                collection(db, 'saveMonthlyReport'),
                where('uid', '==', currentUserUID) // Filter by UID
            );
            const querySnapshot = await getDocs(reportsQuery);

            const data = [];
            querySnapshot.forEach((doc) => {
                const report = doc.data();
                console.log("Report fetched:", report);

                if (report.totalPaid) {
                    data.push({
                        month: new Date(report.year, report.month - 1), // Convert to Date object
                        revenue: report.totalPaid,
                    });
                }
            });

            // Sort data by month/year properly
            data.sort((a, b) => a.month - b.month);

            // Convert back to string format for X-Axis
            const formattedData = data.map(entry => ({
                month: `${entry.month.getMonth() + 1}-${entry.month.getFullYear()}`, // MM-YYYY format
                revenue: entry.revenue,
            }));

            console.log("Final sorted revenue data:", formattedData);
            setRevenueData(formattedData);
        } catch (error) {
            console.error('Error fetching revenue data:', error);
        }
    };

    return (
        <div className="w-full h-96 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Revenue</h2>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
