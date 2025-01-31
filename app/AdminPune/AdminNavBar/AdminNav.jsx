'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import PersonIcon from '@mui/icons-material/Person';
import ProfileModal from '../../components/profileinfo';

const AdminNav = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <div className="lg:hidden">
            <button onClick={() => setIsNavOpen(!isNavOpen)} className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
          <div className={`lg:flex items-center justify-center flex-1 ${isNavOpen ? 'block' : 'hidden'}`}>
            <Link href="../AdminPune/Home" className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase">
            Home
            </Link>
            <Link href="../AdminPune/EmpReport" className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase">
            Emplyee Report
            </Link>
            <Link href="../AdminPune/Reports" className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase">
            Report
            </Link>
          </div>
          <div className={`hidden lg:flex items-center ${isNavOpen ? 'block' : 'hidden'}`}>
            <button onClick={handleModalOpen} className="text-white px-4 py-2 block hover:bg-blue-400 rounded flex items-center">
              <PersonIcon className="w-6 h-6 mr-2" />
            </button>
            <ProfileModal isOpen={isModalOpen} onClose={handleModalClose} />
            <button onClick={handleLogout} className="text-white px-4 py-2 block hover:bg-blue-400 rounded font-bold uppercase ml-4">
              Logout
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AdminNav;
