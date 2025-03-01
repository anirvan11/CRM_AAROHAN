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
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async (userId, status = '', resetPagination = false) => {
    if (!userId) return;
    
    setLoading(true);

    try {
      const baseQuery = query(
        collection(db, 'Customers'),
        where('Allocation', '==', userId),
        ...(status ? [where('Status', '==', status)] : []),
        orderBy('createdAt', 'desc'),
        limit(8)
      );

      const querySnapshot = await getDocs(baseQuery);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCustomers(data);
      setFirstDoc(querySnapshot.docs[0] || null);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setIsNextPage(querySnapshot.docs.length === 8);
      setIsPrevPage(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.uid) {
        fetchCustomers(currentUser.uid, '');
      } else {
        setCustomers([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    if (user?.uid) {
      fetchCustomers(user.uid, newStatus);
    }
  };

  const handleClearFilter = () => {
    setStatusFilter("");
    if (user?.uid) {
      fetchCustomers(user.uid, '');
    }
  };

  return (
    <div className="h-screen w-full bg-white overflow-hidden">
      <NavBar />
      <div className="p-6">
        <div className="mb-4 flex items-center space-x-4 text-black">
          <select
            className="border border-gray-300 rounded-lg p-2"
            value={statusFilter}
            onChange={handleFilterChange}
            disabled={loading}
          >
            <option value="">All Status</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Lost">Lost</option>
            <option value="Won">Won</option>
            <option value="Dead">Dead</option>

          </select>

          <button
            className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50"
            onClick={handleClearFilter}
            disabled={loading || !statusFilter}
          >
            Clear
          </button>
        </div>

        <div className="overflow-auto shadow-lg rounded-lg border border-gray-200">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading customers...</p>
            </div>
          ) : customers.length > 0 ? (
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
                    className="border-b cursor-pointer hover:bg-gray-50"
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
                      <span className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${
                        customer.Status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : customer.Status === 'Verified'
                          ? 'bg-blue-100 text-blue-700'
                          : customer.Status === 'In-Progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {customer.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-600">
              {user ? 'No customers found.' : 'Please log in to view customers.'}
            </div>
          )}
        </div>
      </div>
      <ContactPopup customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />
    </div>
  );
};

export default Contacts;