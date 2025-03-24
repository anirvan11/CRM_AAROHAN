'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import PersonIcon from '@mui/icons-material/Person';
import ProfileModal from '../../components/profileinfo';
import LogoutIcon from '@mui/icons-material/Logout';

const AdminNav = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem('user');
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="bg-blue-900">
      <nav className="bg-blue-900 p-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white text-xl font-bold">
            <img
              src="/favicon.png"
              className="w-20 h-auto p-5"
              alt="Enerfra Logo"
            />
          </div>
          <div className="lg:hidden flex items-center">
            {/* Mobile Logout Button */}
            <button onClick={() => setShowLogoutConfirm(true)} className="text-white px-8 py-5 text-sm">
              <LogoutIcon />
            </button>
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="text-white focus:outline-none ml-auto"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
          <div className={`lg:flex items-center justify-center flex-1 ${isNavOpen ? 'block' : 'hidden'}`}>
            <Link
              href="../AdminPune/Home"
              className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase"
            >
              Home
            </Link>
            <Link
              href="../AdminPune/AdminDashboard"
              className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase"
            >
              Dashboard
            </Link>
            <Link
              href="../AdminPune/AdminContacts"
              className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase"
            >
              Contacts
            </Link>
            <Link
              href="../AdminPune/EmpReport"
              className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase"
            >
              Emplyee Report
            </Link>
            <Link
              href="../AdminPune/Reports"
              className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase"
            >
              Report
            </Link>
            <Link
              href="../AdminPune/AdminTasks"
              className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase"
            >
              Tasks
            </Link>
          </div>
          <div className={`hidden lg:flex items-center ${isNavOpen ? 'block' : 'hidden'}`}>
            <button
              onClick={handleModalOpen}
              className="text-white px-4 py-2 block hover:bg-blue-400 rounded flex items-center"
            >
              <PersonIcon className="w-6 h-6 mr-2" />
            </button>
            <ProfileModal isOpen={isModalOpen} onClose={handleModalClose} />
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase ml-4"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold text-gray-900 mb-4">Are you sure you want to logout?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-gray-500 px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNav;
