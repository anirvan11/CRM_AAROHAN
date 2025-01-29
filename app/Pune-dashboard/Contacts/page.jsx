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

  // Fetch customers based on pagination
  const fetchCustomers = async (direction = 'next') => {
    if (!user) return;

    let q;
    const baseQuery = collection(db, 'Customers');
    const orderedQuery = query(
      baseQuery,
      where('Allocation', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(8)
    );

    if (direction === 'next' && lastDoc) {
      q = query(orderedQuery, startAfter(lastDoc));
    } else if (direction === 'prev' && firstDoc) {
      q = query(orderedQuery, startAt(firstDoc));
    } else {
      q = orderedQuery;
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setCustomers(data);
    setFirstDoc(querySnapshot.docs[0]);
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setIsNextPage(querySnapshot.docs.length === 8);
    setIsPrevPage(firstDoc !== null && direction === 'next');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchCustomers();
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleRowDoubleClick = (customerId) => {
    setSelectedCustomerId(customerId);
  };

  const closePopup = () => {
    setSelectedCustomerId(null);
  };

  return (
    <div className="h-screen w-full bg-white overflow-hidden">
      <NavBar />
      <div className="p-6">
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
                  onDoubleClick={() => handleRowDoubleClick(customer.id)}
                >
                  <td className="py-3 px-4 text-sm text-gray-700">{customer.Person}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{customer['Company Name']}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{customer.Phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{customer.Email}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {customer.LastTouch && customer.LastTouch.seconds
                      ? new Date(customer.LastTouch.seconds * 1000).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${
                        customer.Status === 'Active'
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
      <ContactPopup customerId={selectedCustomerId} onClose={closePopup} />
    </div>
  );
};

export default Contacts;
