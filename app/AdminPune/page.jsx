"use client";
import React, { useState } from "react";
import AdminNav from "./AdminNavBar/AdminNav";
import CreateUser from "../components/CreateUser"; // Ensure this file exists
import AddCustomer from "../components/CreateCustomer"; // Create this file for the Add Customer form

const AdminPune = () => {
  const [showUserForm, setShowUserForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  return (
    <div className="h-screen w-full bg-white overflow-auto">
      <AdminNav />

      <div className="relative p-4 flex gap-4">
        {/* Blue "ADD USER" button */}
        <button
          onClick={() => {
            setShowUserForm(!showUserForm);
            setShowCustomerForm(false); // Close customer form if open
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          {showUserForm ? "Close" : "ADD USER"}
        </button>

        {/* Blue "ADD CUSTOMER" button */}
        <button
          onClick={() => {
            setShowCustomerForm(!showCustomerForm);
            setShowUserForm(false); // Close user form if open
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
        >
          {showCustomerForm ? "Close" : "ADD CUSTOMER"}
        </button>
      </div>

      {/* Show the user creation form when toggled */}
      {showUserForm && <CreateUser />}

      {/* Show the customer creation form when toggled */}
      {showCustomerForm && <AddCustomer />}
    </div>
  );
};

export default AdminPune;
