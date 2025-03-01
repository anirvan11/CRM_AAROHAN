'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import PersonIcon from '@mui/icons-material/Person';
import ProfileModal from '../../components/profileinfo';
import LogoutIcon from '@mui/icons-material/Logout';

const NavBarPanel = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
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
            <button onClick={handleLogoutConfirm} className="text-white px-3 py-2 text-sm mr-4">
              <LogoutIcon />
            </button>
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="text-white focus:outline-none"
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
          <div className={`hidden lg:flex items-center ${isNavOpen ? 'block' : 'hidden'}`}>
            <button
              onClick={handleModalOpen}
              className="text-white px-4 py-2 block hover:bg-blue-400 rounded flex items-center"
            >
              <PersonIcon className="w-6 h-6 mr-2" />
            </button>
            <ProfileModal isOpen={isModalOpen} onClose={handleModalClose} />
            <button
              onClick={handleLogoutConfirm}
              className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase ml-4"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold text-gray-900">Are you sure you want to logout?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCancelLogout}
                className="bg-gray-300 text-gray-900 px-4 py-2 rounded mr-2 hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBarPanel;
