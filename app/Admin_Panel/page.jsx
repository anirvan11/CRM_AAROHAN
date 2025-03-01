'use client';
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';
import NavBarPanel from './NavBarPanel/NavBarPanel';

function Panel() {
  const [pendingQuotations, setPendingQuotations] = useState([]);
  const [userBranch, setUserBranch] = useState('');

  useEffect(() => {
    const fetchUserBranch = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setUserBranch(userData.Branch);
        }
      } catch (error) {
        console.error('Error fetching user branch:', error);
      }
    };

    fetchUserBranch();
  }, []);

  useEffect(() => {
    if (!userBranch) return; // Only fetch data when branch is available

    const fetchPendingQuotations = async () => {
      try {
        const quotationQuery = query(collection(db, 'PendingQuotation'), where('Branch', '==', userBranch));
        const quotationSnapshot = await getDocs(quotationQuery);
        const quotations = quotationSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPendingQuotations(quotations);
      } catch (error) {
        console.error('Error fetching pending quotations:', error);
      }
    };

    fetchPendingQuotations();
  }, [userBranch]); // Refetch when the branch is set

  const handleApproval = async (pendingQuotationId, customerId) => {
    try {
      const pendingQuotationRef = doc(db, 'PendingQuotation', pendingQuotationId);
      const pendingQuotationSnap = await getDoc(pendingQuotationRef);

      if (!pendingQuotationSnap.exists()) return;

      const pendingQuotationData = pendingQuotationSnap.data();

      const customerRef = doc(db, 'Customers', customerId);
      await updateDoc(customerRef, {
        Quotation: pendingQuotationData.Quotation,
      });

      await deleteDoc(pendingQuotationRef);
      setPendingQuotations((prev) => prev.filter((q) => q.id !== pendingQuotationId));
      console.log('Quotation approved and updated in Customers.');
    } catch (error) {
      console.error('Error approving quotation:', error);
    }
  };

  const handleRejection = async (pendingQuotationId) => {
    try {
      const pendingQuotationRef = doc(db, 'PendingQuotation', pendingQuotationId);
      await deleteDoc(pendingQuotationRef);
      setPendingQuotations((prev) => prev.filter((q) => q.id !== pendingQuotationId));
      console.log('Quotation update rejected.');
    } catch (error) {
      console.error('Error rejecting quotation:', error);
    }
  };

  return (
    <div className="h-screen w-full bg-white overflow-hidden">
      <NavBarPanel />
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-black">Pending Quotations</h2>
      {pendingQuotations.length === 0 ? (
        <p className="text-gray-600">No pending quotations for your branch.</p>
      ) : (
        <div className="space-y-4">
          {pendingQuotations.map((quotation) => (
            <div key={quotation.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-black">{quotation.RequestedBy}</h3>
              <h3 className="text-lg font-semibold text-black">{quotation.customerId}</h3>
              <p className="text-black">Total: {quotation.Quotation?.Total}</p>
              <p className="text-black">Paid: {quotation.Quotation?.Paid}</p>
              <p className="text-black">Left: {quotation.Quotation?.Left}</p>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleApproval(quotation.id, quotation.customerId)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRejection(quotation.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

export default Panel;
