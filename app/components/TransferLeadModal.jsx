'use client'
import React, { useEffect, useState } from "react";
import { db } from "../firebase/config"; // Ensure this path is correct
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const TransferLeadModal = ({ customer, onClose, onTransferComplete }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const userList = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleTransfer = async () => {
    if (!selectedUser) return alert("Please select a user.");

    try {
      const customerRef = doc(db, "Customers", customer.id);
      await updateDoc(customerRef, {
        Allocation: selectedUser,
      });

      if (onTransferComplete) {
        onTransferComplete(customer.id, selectedUser);
      }

      alert("Lead transferred successfully!");
      onClose();
    } catch (err) {
      console.error("Transfer error:", err);
      alert("Failed to transfer lead.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-lg font-semibold text-black mb-4">
          Transfer Lead: {customer["Company Name"]}
        </h2>
        <select
          className="w-full border p-2 mb-4"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.uid} value={user.uid}>
              {user.Name} ({user.Branch})
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleTransfer}
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferLeadModal;
