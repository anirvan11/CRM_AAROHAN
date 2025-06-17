'use client'
import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const ChangeLead = () => {
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedNewUser, setSelectedNewUser] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentBranch, setCurrentBranch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customersSnapshot = await getDocs(collection(db, "Customers"));
        const usersSnapshot = await getDocs(collection(db, "users"));

        const customersData = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const usersData = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
        }));

        setCustomers(customersData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const selectedCustomer = customers.find(c => c["Company Name"] === selectedCustomerId);
    if (selectedCustomer) {
      const branch = selectedCustomer.Branch;
      setCurrentBranch(branch);
      const eligibleUsers = users.filter(
        user => user.Branch === branch || user.Role === "Admin"
      );
      setFilteredUsers(eligibleUsers);
    } else {
      setFilteredUsers([]);
    }
  }, [selectedCustomerId, customers, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedNewUser) {
      alert("Please select both a customer and a new user.");
      return;
    }

    try {
      const customerDocRef = doc(db, "Customers", selectedCustomerId);
      await updateDoc(customerDocRef, {
        Allocation: selectedNewUser,
      });
      alert("Lead updated successfully!");
      setSelectedCustomerId("");
      setSelectedNewUser("");
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  return (
    <div className="mt-10 p-4 bg-white rounded-lg shadow max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4 text-black">Change Customer Lead</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 text-black">Select Customer</label>
        <select
          className="border p-2 w-full mb-4 text-black"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        >
          <option value="">Choose a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer["Company Name"]}>
              {customer["Company Name"]}
            </option>
          ))}
        </select>

        {filteredUsers.length > 0 && (
          <>
            <label className="block mb-2 text-black">Reassign to</label>
            <select
              className="border p-2 w-full mb-4 text-black"
              value={selectedNewUser}
              onChange={(e) => setSelectedNewUser(e.target.value)}
            >
              <option value="">Choose a user</option>
              {filteredUsers.map((user) => (
                <option key={user.uid} value={user.uid}>
                  {user.Name}
                </option>
              ))}
            </select>
          </>
        )}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Change Lead
        </button>
      </form>
    </div>
  );
};

export default ChangeLead;
