"use client";
import { useState } from "react";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function CreateUser() {
  const [userData, setUserData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Branch: "North",
    Role: "Employee",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.Email,
        userData.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        Name: userData.Name,
        Email: userData.Email,
        Phone: userData.Phone,
        Branch: userData.Branch,
        Role: userData.Role,
        uid: user.uid,
      });

      alert("User created successfully!");
      setUserData({ Name: "", Email: "", Phone: "", Branch: "North", Role: "Employee", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-black mb-2">Create New User</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="Name" placeholder="Full Name" value={userData.Name} onChange={handleChange} className="w-full p-2 text-black border  rounded-md" required />
        <input type="email" name="Email" placeholder="Email" value={userData.Email} onChange={handleChange} className="w-full p-2 text-black border rounded-md" required />
        <input type="number" name="Phone" placeholder="Phone Number" value={userData.Phone} onChange={handleChange} className="w-full p-2 text-black border rounded-md" required />
        <input type="password" name="password" placeholder="Password" value={userData.password} onChange={handleChange} className="w-full p-2 text-black border rounded-md" required />
        <select name="Branch" value={userData.Branch} onChange={handleChange} className="w-full p-2 text-black  border rounded-md">
          <option value="North">3s Sales Corporation</option>
          <option value="North2">3s Enterprises</option>
          <option value="Pune">Aarohan</option>
        </select>
        <select name="Role" value={userData.Role} onChange={handleChange} className="w-full p-2 text-black border rounded-md">
          <option value="Employee">Employee</option>
          <option value="Admin">Admin</option>
          <option value="Panel">Panel</option>

        </select>
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
