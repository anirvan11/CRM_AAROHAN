'use client';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  startAt,
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import NavBar from '../NavBar/NavBar';
import ContactPopup from '@/app/components/contactpopup';

const Contacts = () => {
  const [customers, setCustomers] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [isNextPage, setIsNextPage] = useState(false);
  const [isPrevPage, setIsPrevPage] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [user, setUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState(""); // Filter selection

  // Fetch customers based on filters & pagination
  const fetchCustomers = async (direction = 'next', status = "") => {
    if (!user) return;

    let q;
    let baseQuery = query(
      collection(db, 'Customers'),
      where('Allocation', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(8)
    );

    // Apply status filter only if it's provided
    if (status) {
      baseQuery = query(baseQuery, where('Status', '==', status));
    }

    // Handle pagination
    if (direction === 'next' && lastDoc) {
      q = query(baseQuery, startAfter(lastDoc));
    } else if (direction === 'prev' && firstDoc) {
      q = query(baseQuery, startAt(firstDoc));
    } else {
      q = baseQuery;
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setCustomers(data);
    setFirstDoc(querySnapshot.docs[0]);
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setIsNextPage(querySnapshot.docs.length === 8);
    setIsPrevPage(firstDoc !== null && direction === 'next');
  };

  // Fetch all customers initially when user logs in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchCustomers(); // fetch without any filter to show all contacts by default
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    fetchCustomers("next", e.target.value); // Apply filter immediately when changed
  };

  const handleClearFilter = () => {
    setStatusFilter(""); // Clear the filter
    fetchCustomers("next", ""); // Show all contacts when filter is cleared
  };

  return (
    <div className="h-screen w-full bg-white overflow-hidden">
      <NavBar />
      <div className="p-6">
        {/* Filter Dropdown & Buttons */}
        <div className="mb-4 flex items-center space-x-4">
          <select
            className="border border-gray-300 rounded-lg p-2"
            value={statusFilter}
            onChange={handleFilterChange} // Apply the filter when value changes
          >
            <option value="">All Status</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            onClick={handleClearFilter} // Clear the filter
          >
            Clear
          </button>
        </div>

        {/* Customer Table */}
        <div className="overflow-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Customer Name</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Phone Number</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Last Activity</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b cursor-pointer"
                  onDoubleClick={() => setSelectedCustomerId(customer.id)}
                >
                  <td className="py-3 px-4 text-sm text-gray-700">{customer.Person}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{customer['Company Name']}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{customer.Phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{customer.Email}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {customer.LastTouch?.seconds
                      ? new Date(customer.LastTouch.seconds * 1000).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${
                        customer.Status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {customer.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Buttons */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2"
            onClick={() => fetchCustomers('prev')}
            disabled={!isPrevPage}
          >
            Previous
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
            onClick={() => fetchCustomers('next')}
            disabled={!isNextPage}
          >
            Next
          </button>
        </div>
      </div>
      <ContactPopup customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />
    </div>
  );
};

export default Contacts;

