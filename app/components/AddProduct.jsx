"use client";
import React, { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const AddProduct = () => {
  const [productName, setProductName] = useState("");

  const handleAddProduct = async () => {
    const trimmedName = productName.trim();
    if (!trimmedName) {
      alert("Product name cannot be empty.");
      return;
    }

    // Optional: Check for duplicates
    const q = query(collection(db, "Product"), where("name", "==", trimmedName));
    const existing = await getDocs(q);
    if (!existing.empty) {
      alert("Product already exists.");
      return;
    }

    try {
      await addDoc(collection(db, "Product"), { name: trimmedName });
      alert("Product added successfully!");
      setProductName("");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-black">Add Product</h2>
      <input
        type="text"
        className="border p-2 w-full mb-4 text-black"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Enter product name"
      />
      <button
        onClick={handleAddProduct}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Product
      </button>
    </div>
  );
};

export default AddProduct;
