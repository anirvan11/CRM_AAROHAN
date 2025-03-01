'use client';
import React, { useEffect, useState } from 'react';
import {auth, db } from '../firebase/config';
import { collection, getDocs, query, where,doc,getDoc } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EmpRevenueChart = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [employees, setEmployees] = useState([]); // For storing employee data
    const [selectedEmployeeUID, setSelectedEmployeeUID] = useState(null); // For storing selected employee UID
    const [userBranch, setUserBranch] = useState('');

    useEffect(() => {
        // Fetch logged-in user's branch
        const fetchUserBranch = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserBranch(userSnap.data().Branch);
                }
            } catch (error) {
                console.error('Error fetching user branch:', error);
            }
        };

        fetchUserBranch();
    }, []);

    useEffect(() => {
        if (!userBranch) return;

        const fetchEmployees = async () => {
            try {
                const employeesRef = collection(db, 'users');
                const q = query(employeesRef, where('Branch', '==', userBranch)); // Filter by branch
                
                const employeesSnapshot = await getDocs(q);
                const employeeList = employeesSnapshot.docs
                    .map(doc => ({
                        uid: doc.id,
                        name: doc.data().Name,
                        role: doc.data().Role // Assuming 'Role' field exists
                    }))
                    .filter(emp => emp.role !== 'Admin' && emp.role !== 'Panel'); // Filter out Admin and Panel roles

                setEmployees(employeeList);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, [userBranch]);

    // Fetch revenue data for a selected employee
    const fetchRevenueData = async (employeeUID) => {
        try {
            console.log("Fetching revenue for employee:", employeeUID);

            // Query the reports for the selected employee
            const reportsQuery = query(
                collection(db, 'saveMonthlyReport'),
                where('uid', '==', employeeUID) // Filter by employee UID
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

            // Sort data by month/year
            data.sort((a, b) => a.month - b.month);

            // Format the data for the X-Axis
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

    // Handle the employee selection change
    const handleEmployeeChange = (event) => {
        const selectedUID = event.target.value;
        setSelectedEmployeeUID(selectedUID);
        fetchRevenueData(selectedUID); // Fetch data for the selected employee
    };

    return (
        <div className="w-full h-96 bg-white rounded-lg shadow-md p-6 overflow-auto">
            <h2 className="text-lg font-semibold text-black mb-4">Revenue</h2>

            {/* Dropdown to select an employee */}
            <div className="mb-4 text-black">
                <label htmlFor="employee-select" className="text-sm text-black font-medium">Select Employee:</label>
                <select
                    id="employee-select"
                    value={selectedEmployeeUID || ''}
                    onChange={handleEmployeeChange}
                    className="mt-2 p-2 border border-gray-300 rounded"
                >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                        <option key={employee.uid} value={employee.uid}>
                            {employee.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Display chart only when an employee is selected */}
            {selectedEmployeeUID && (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default EmpRevenueChart;
