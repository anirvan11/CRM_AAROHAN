'use client';
import React, { useState, useEffect } from 'react';

const ProfileModal = ({ isOpen, onClose }) => {
  const [userData, setUserData] = useState({
    Name: '',
    Email: '',
    Role: '',
    Phone: '',
    uid: '',
  });

  useEffect(() => {
    const storedUserData = sessionStorage.getItem('user');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
      <div className="flex items-center h-screen w-full justify-center">
        <div className="max-w-xs">
          <div className="bg-white shadow-xl rounded-lg py-3">
            <div className="p-2">
              <h3 className="text-center text-xl text-gray-900 font-medium leading-8">
                {userData.Name}
              </h3>
              <div className="text-center text-gray-400 text-xs font-semibold">
                <p>{userData.Role}</p>
              </div>
              <table className="text-xs my-3 text-black">
                <tbody>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">Phone</td>
                    <td className="px-2 py-2">{userData.Phone}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">Email</td>
                    <td className="px-2 py-2">{userData.Email}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">UID</td>
                    <td className="px-2 py-2">{userData.uid}</td>
                  </tr>
                </tbody>
              </table>

              <div className="text-center my-3">
                <button
                  onClick={onClose}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;