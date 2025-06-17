"use client";
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/config"; // Ensure auth is imported
import { collection, getDocs, setDoc, doc, deleteDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import AdminNav from "../AdminNavBar/AdminNav";
import CreateUser from "../../components/CreateUser";
import AddCustomer from "../../components/CreateCustomer";
import ChangeLead from "@/app/components/ChangeLead";

const Home = () => {
  const [showUserForm, setShowUserForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [userBranch, setUserBranch] = useState(null);
  const [showChangeLead, setShowChangeLead] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        console.warn("No user logged in");
        setUserBranch(null);
        return;
      }

      try {
        const usersRef = collection(db, "users"); // Reference to Users collection
        const q = query(usersRef, where("uid", "==", currentUser.uid)); // Query by UID
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data(); // Get user data
          console.log("User Data:", userData); // Debugging log
          setUserBranch(userData.Branch); // Store only Branch
        } else {
          console.warn("User not found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching user branch:", error);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []); // Runs only once on mount


  // Fetch pending customers only for the Admin's branch
  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        if (!userBranch) return;

        const querySnapshot = await getDocs(
          query(collection(db, "TemporaryCustomer"), where("Branch", "==", userBranch))
        );

        const customers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPendingCustomers(customers);
      } catch (error) {
        console.error("Error fetching pending customers:", error);
      }
    };

    fetchPendingCustomers();
  }, [userBranch]); // Run this when adminBranch is available

  // Approve customer and move to "Customers" collection
  const handleApprove = async (customer) => {
    try {
      await setDoc(doc(db, "Customers", customer.id), {
        ...customer,
        Status: "Pending",
      });
      await deleteDoc(doc(db, "TemporaryCustomer", customer.id));

      setPendingCustomers((prev) => prev.filter((c) => c.id !== customer.id));

      alert("Customer Approved!");
    } catch (error) {
      console.error("Error approving customer:", error);
    }
  };

  // Reject customer (delete from TemporaryCustomer)
  const handleReject = async (customerId) => {
    try {
      await deleteDoc(doc(db, "TemporaryCustomer", customerId));

      setPendingCustomers((prev) => prev.filter((c) => c.id !== customerId));

      alert("Customer Rejected!");
    } catch (error) {
      console.error("Error rejecting customer:", error);
    }
  };

  return (
    <div className="h-screen w-full bg-white overflow-auto">
      <AdminNav />

      <div className="relative p-4 flex gap-4">
        {/* Blue "ADD USER" button */}
        <button
          onClick={() => {
            setShowUserForm(!showUserForm);
            setShowCustomerForm(false);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          {showUserForm ? "Close" : "ADD USER"}
        </button>

        {/* Blue "ADD CUSTOMER" button */}
        <button
          onClick={() => {
            setShowCustomerForm(!showCustomerForm);
            setShowUserForm(false);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
        >
          {showCustomerForm ? "Close" : "ADD Lead"}
        </button>
        {/* Blue "Change Lead" button */}
        <button
          onClick={() => {
            setShowChangeLead(!showChangeLead);
            setShowCustomerForm(false);
            setShowUserForm(false);
          }}
        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition"
      >
      {showChangeLead ? "Close" : "Change Lead"}
        </button>
      </div>

      {/* Show the user creation form when toggled */}
      {showUserForm && <CreateUser />}

      {/* Show the customer creation form when toggled */}
      {showCustomerForm && <AddCustomer />}

      {showChangeLead && <ChangeLead />}


      {/* Admin Approval Section */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-black">Pending Approvals</h2>
        {pendingCustomers.length === 0 ? (
          <p className="text-gray-500">No pending approvals</p>
        ) : (
          <div className="space-y-4">
            {pendingCustomers.map((customer) => (
              <div key={customer.id} className="border p-4 rounded-lg shadow-md bg-gray-50">
                <h3 className="text-lg font-semibold text-black">{customer["Company Name"]}</h3>
                <p className="text-gray-700">Person: {customer.Person}</p>
                <p className="text-gray-700">Email: {customer.Email}</p>
                <p className="text-gray-700">Phone: {customer.Phone}</p>
                <p className="text-gray-700">Products: {Object.keys(customer.Products || {}).join(", ")}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleApprove(customer)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(customer.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
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
};

export default Home;
