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
    setError(null); // Clear any previous error

    try {
      // Step 1: Authenticate the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      console.log(`Authenticated User ID: ${userId}`); // Log user ID

  // Step 2: Retrieve user data from Firestore
const userDocRef = doc(db, "users", userId);
const userDocSnap = await getDoc(userDocRef);

if (userDocSnap.exists()) {
  const userData = userDocSnap.data();
  console.log("User Data:", userData); // Log fetched user data

  // Store the user data in session storage
  sessionStorage.setItem('user', JSON.stringify(userData));

  // Step 3: Redirect based on user role and branch
  if (userData.Role === "Employee" && userData.Branch === "North") {
    console.log("Redirecting to North dashboard...");
  } else if (userData.Role === "Employee" && userData.Branch === "Pune") {
    router.push('/Pune-dashboard');
    console.log("Redirecting to Pune dashboard...");
  } 
  else if (userData.Role === "Admin" && userData.Branch === "Pune") {
    router.push('/AdminPune');
    console.log("Redirecting to Pune dashboard...");
  } else {
    console.log("Unauthorized access. Role or branch mismatch.");
    setError("Unauthorized access. Please contact admin.");
  }
} else {
  console.log("User document not found in Firestore.");
  setError("User data not found. Please contact admin.");
}

    } catch (err) {
      console.error("Error during login:", err); // Log error details
      setError(err.message); // Display the error
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Section */}
      <div className="flex flex-col w-1/2 bg-gradient-to-b from-blue-300 to-blue-900 text-white p-10">
      <div className="absolute top-0 left-0 mt-4 ml-4">
          <img src="/favicon.png" alt="Logo" className="w-12 h-auto mb-3" />
      </div>

        <div className="flex flex-col items-center justify-center flex-grow">
          <h1 className="text-5xl font-extrabold mb-4">Hey There!</h1>
          <p className="text-2xl font-medium leading-relaxed text-center">
            Welcome Back. You are just one step away from your work.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col justify-center w-1/2 bg-gray-50 px-20 py-24">
        <h2 className="mb-6 text-4xl font-bold text-gray-800">Sign In</h2>
        {error && <p className="mb-4 text-lg text-red-600 font-medium">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-xl font-semibold text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 text-lg border border-black text-black rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400"
            />
          </div>
          <div className="relative">
  <label
    htmlFor="password"
    className="block text-xl font-semibold text-gray-700 mb-2"
  >
    Password
  </label>
  <input
    id="password"
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full px-6 py-4 text-lg border border-black text-black rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-400 hover:text-black"
    style={{ top: "70%", transform: "translateY(-50%)" }}
  >
    {showPassword ? <VisibilityOff /> : <Visibility />}
  </button>
</div>

          <button
            type="submit"
            className="w-full px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-300 to-blue-900 rounded-lg hover:bg-gradient-to-l focus:outline-none focus:ring-4 focus:ring-indigo-400"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
