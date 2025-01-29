'use client';
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const ContactPopup = ({ customerId, onClose }) => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false); // For smooth transition

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) return;
      setLoading(true);

      try {
        const docRef = doc(db, 'Customers', customerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCustomerData({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }

      setLoading(false);
      setIsVisible(true); // Show the popup smoothly after loading
    };

    fetchCustomerData();
  }, [customerId]);

  const handleClose = () => {
    setIsVisible(false); // Trigger the exit animation
    setTimeout(onClose, 300); // Delay onClose to allow the animation to finish
  };

  if (!customerId) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-[#f9f9f9] w-11/12 md:w-2/5 lg:w-1/3 rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 ${
          isVisible ? 'scale-100' : 'scale-90'
        }`}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center bg-blue-900 p-4 rounded-t-lg">
          <h2 className="text-lg font-semibold text-white">
            {loading ? 'Loading...' : customerData?.Person || 'Customer Details'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 text-2xl font-bold focus:outline-none"
          >
            ×
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 text-[#333]">
          {loading ? (
            <p className="text-center text-gray-500">Loading customer details...</p>
          ) : customerData ? (
            <>
              {/* Customer Details */}
              <div className="space-y-2 mb-4">
                <p>
                  <strong className="text-blue-900">Phone number:</strong> {customerData.Phone}
                </p>
                <p>
                  <strong className="text-blue-900">Email:</strong> {customerData.Email}
                </p>
                <p>
                  <strong className="text-blue-900">Company Name:</strong> {customerData['Company Name']}
                </p>
                <p>
                  <strong className="text-blue-900">Lead Status:</strong>{' '}
                  {customerData.Status || 'N/A'}
                </p>
                <p>
                  <strong className="text-blue-900">Last Contacted:</strong>{' '}
                  {customerData.LastTouch && customerData.LastTouch.seconds
                    ? new Date(customerData.LastTouch.seconds * 1000).toLocaleString()
                    : 'N/A'}
                </p>
              </div>

              {/* Product List */}
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Product List</h3>
                <table className="w-full mt-2 border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left text-blue-900">Name</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-blue-900">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(customerData.Products || {}).map(([product, qty]) => (
                      <tr key={product} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-[#333]">{product}</td>
                        <td className="border border-gray-300 px-3 py-2 text-[#333]">{qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">Customer data not found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPopup;
