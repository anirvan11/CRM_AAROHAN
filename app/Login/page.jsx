"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/config";
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      console.log(`Authenticated User ID: ${userId}`);

      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("User Data:", userData);
        sessionStorage.setItem('user', JSON.stringify(userData));

        if (userData.Role === "Employee") {
          router.push('/Pune-dashboard');
        } else if (userData.Role === "Admin") {
          router.push('/AdminPune');
        }
          else if (userData.Role === "Panel" ) {
            router.push('/Admin_Panel');
        } else {
          setError("Unauthorized access. Please contact admin.");
        }
      } else {
        setError("User data not found. Please contact admin.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans">
      <div className="relative flex flex-col md:w-1/2 bg-gradient-to-b from-blue-300 to-blue-900 text-white p-20 md:p-20 justify-center items-center md:items-start">
        
        {/* Aarohan Logo - Only visible on larger screens */}
        <img 
  src="/aarohan_logo.png" 
  alt="Aarohan Logo" 
  className="hidden md:block absolute top-10 left-0 transform w-48 h-auto"
/>


        <h1 className="text-5xl font-extrabold mb-4">Hey There!</h1>
        <p className="text-2xl font-medium leading-relaxed text-center md:text-left">
          Welcome Back. You are just one step away from your work.
        </p>
      </div>

      <div className="flex flex-col justify-end md:justify-center w-full md:w-1/2 bg-gray-50 px-8 py-16 md:px-20 md:py-24 flex-grow">
        <h2 className="mb-6 text-4xl font-bold text-gray-800 text-center md:text-left">Sign In</h2>
        {error && <p className="mb-4 text-lg text-red-600 font-medium text-center md:text-left">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xl font-semibold text-gray-700 mb-2">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-6 py-4 text-lg border border-black text-black rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400" />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-xl font-semibold text-gray-700 mb-2">Password</label>
            <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-6 py-4 text-lg border border-black text-black rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-400 hover:text-black" style={{ top: "70%", transform: "translateY(-50%)" }}>
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
          </div>
          <button type="submit" className="w-full px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-300 to-blue-900 rounded-lg hover:bg-gradient-to-l focus:outline-none focus:ring-4 focus:ring-indigo-400">Sign In</button>
        </form>
      </div>
    </div>
  );
}
