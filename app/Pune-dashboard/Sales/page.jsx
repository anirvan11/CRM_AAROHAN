'use client' 
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import NavBar from '../NavBar/NavBar';

export default function SalesPage() {
  const [customers, setCustomers] = useState({
    pending: [],
    Lost: [],
    verified: [],
    Won: []
  });
  const [user, setUser] = useState(null);
  const statusColors = {
    pending: 'text-yellow-600',
    Lost: 'text-red-600',
    verified: 'text-blue-600',
    Won: 'text-green-600'
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const q = query(
            collection(db, 'Customers'),
            where('Allocation', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const customersList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        
          const groupedCustomers = {
            pending: customersList.filter(customer => customer.Status === 'Pending'),
            verified: customersList.filter(customer => customer.Status === 'Verified'),
            Won: customersList.filter(customer => customer.Status === 'Won'),
            Lost: customersList.filter(customer => customer.Status === 'Lost'),

          };
          setCustomers(groupedCustomers);
        } catch (error) {
          console.error("Error fetching customers: ", error);
        }
      } else {
        setUser(null);
        setCustomers({ pending: [], Lost: [], verified: [], Won: [] });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="h-screen w-full bg-gray-100 overflow-auto">
      <NavBar />
      <div className="container mx-auto py-4 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">Sales Board</h1>
        
        {/* Responsive Layout */}
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          {Object.keys(customers).map((status, index) => (
            <div 
              key={index} 
              className="flex-1 bg-white shadow-lg rounded-lg p-4 max-h-[70vh] overflow-y-auto"
            >
              <h2 className={`text-lg font-semibold mb-4 ${statusColors[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </h2>
              
              <div className="space-y-4">
                {customers[status].map(customer => (
                  <div key={customer.id} className="p-4 bg-gray-50 rounded-lg shadow-md">
                    <p className="font-bold text-gray-800">{customer['Company Name']}</p>
                    <p className="text-gray-700">{customer.Person}</p>
                    <p className="text-gray-700">{customer.Phone}</p>
                    <p className="text-gray-600">{customer.Note}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
