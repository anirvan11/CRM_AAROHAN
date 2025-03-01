'use client'
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import EditPopup from './popup';

export default function FollowUpTable() {
  const [customers, setCustomers] = useState([]);
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPopId, setShowPopId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const q = query(
            collection(db, 'Customers'),
            where('Allocation', '==', currentUser.uid),
            orderBy('createdAt', 'desc') // Sort by 'createdAt' in descending order
          );
          const querySnapshot = await getDocs(q);
          const customersList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Filter out customers with "Completed" status
          const filteredCustomers = customersList.filter(
            customer => customer.Status !== 'Won' && customer.Status !== 'Dead' && customer.Status !== 'Lost'
          );
          setCustomers(filteredCustomers);
          

        } catch (error) {
          console.error("Error fetching customers: ", error);
        }
      } else {
        setUser(null);
        setCustomers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="p-4 bg-stone-200 rounded-lg shadow-lg z-[1] overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4 text-black text-center">Follow-Up's</h1>
      <div className="w-full overflow-x-auto">
        <table className="w-full bg-white border border-gray-300 rounded-lg shadow-lg text-sm md:text-base">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-2 md:px-4 border-b text-left text-black">Company</th>
              <th className="py-2 px-2 md:px-4 border-b text-left text-black">Name</th>
              <th className="py-2 px-2 md:px-4 border-b text-left text-black">Number</th>
              <th className="py-2 px-2 md:px-4 border-b text-left text-black">Status</th>
              <th className="py-2 px-2 md:px-4 border-b text-left text-black">Action</th>
              <th className="py-2 px-2 md:px-4 border-b text-left text-black">Prev Comment</th>
              <th className="py-2 px-2 md:px-4 border-b text-left text-black">Quotation</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-100">
                <td className="py-2 px-2 md:px-4 border-b text-black">{customer['Company Name']}</td>
                <td className="py-2 px-2 md:px-4 border-b text-black">{customer.Person}</td>
                <td className="py-2 px-2 md:px-4 border-b text-black">{customer.Phone}</td>
                <td className="py-2 px-2 md:px-4 border-b text-black">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs md:text-sm ${
                      customer.Status === 'Pending' ? 'bg-yellow-500' :
                      customer.Status === 'Verified' ? 'bg-blue-500' :
                      customer.Status === 'Won' ? 'bg-green-500' : 
                      customer.Status === 'Lost' ? 'bg-gray-500' :
                        customer.Status === 'Dead' ? 'bg-red-500' : ''
                    }`}
                  >
                    {customer.Status}
                  </span>
                </td>
                <td className="py-2 px-2 md:px-4 border-b">
                  <button
                    className="bg-blue-500 text-white px-2 md:px-4 py-1 md:py-2 rounded shadow"
                    onClick={() => handleEditClick(customer)}
                  >
                    Action
                  </button>
                </td>
                <td className="py-2 px-2 md:px-4 border-b text-black">{customer.Note}</td>
                <td className="py-2 px-2 md:px-4 border-b text-black">
                  <button
                    onClick={() => setShowPopId(customer.id)}
                    className="w-full text-left"
                  >
                    {customer.Quotation.Total}
                  </button>
                  {showPopId === customer.id && (
                    <div className="absolute bg-white border border-gray-300 shadow-lg p-4 rounded-lg text-sm md:text-base">
                      <p><strong>Total:</strong> {customer.Quotation.Total}</p>
                      <p><strong>Paid:</strong> {customer.Quotation.Paid}</p>
                      <p><strong>Left:</strong> {customer.Quotation.Left}</p>
                      <button
                        onClick={() => setShowPopId(null)}
                        className="mt-2 text-blue-500 hover:underline"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <EditPopup customer={selectedCustomer} onClose={handleClosePopup} />
      )}
    </div>
  );
}
