'use client';
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';

function EditPopup({ customer, onClose }) {
  const [followUpMethod, setFollowUpMethod] = useState('Call');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState(customer.Status);
  const [totalQuotation, setTotalQuotation] = useState('');
  const [paidQuotation, setPaidQuotation] = useState('');
  const [leftQuotation, setLeftQuotation] = useState('');
  const [showTaskFields, setShowTaskFields] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStartDate, setTaskStartDate] = useState('');
  const [taskEndDate, setTaskEndDate] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    if (customer.Quotation) {
      setTotalQuotation(customer.Quotation.Total);
      setPaidQuotation(customer.Quotation.Paid);
      setLeftQuotation(customer.Quotation.Left);
    }
    setNote(customer.Note || '');
    setCompanyName(customer['Company Name'] || ''); // Automatically set company name
  }, [customer]);

  const handleUpdate = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    try {
      const customerDoc = doc(db, 'Customers', customer.id);
      const updates = {
        FollowUpMethod: followUpMethod,
        Note: note,
        Status: status,
        Quotation: {
          Total: totalQuotation,
          Paid: paidQuotation,
          Left: leftQuotation,
        },
      };

      if (status === 'Completed') {
        updates.LastTouch = new Date();
      }

      await updateDoc(customerDoc, updates);

      if (showTaskFields && taskName && taskDescription && taskStartDate && taskEndDate) {
        await addDoc(collection(db, 'Tasks'), {
          TaskName: taskName,
          Company: companyName, // Use pre-filled company name
          Description: taskDescription,
          StartDate: taskStartDate,
          EndDate: taskEndDate,
          Status: 'Not finished',
          By: user ? user.uid : 'Anonymous',
        });
      }

      onClose();
    } catch (error) {
      console.error("Error updating customer or adding task: ", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1]">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[40rem] max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-bold text-center mb-4 text-black">{customer.Person}</h2>
        <h3 className="text-md font-semibold mb-2 text-black">Follow Up Status</h3>
        <div className="flex space-x-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="Call"
              checked={followUpMethod === 'Call'}
              onChange={(e) => setFollowUpMethod(e.target.value)}
              className="form-radio text-blue-600"
            />
            <span className="text-black">Call</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="Mail"
              checked={followUpMethod === 'Mail'}
              onChange={(e) => setFollowUpMethod(e.target.value)}
              className="form-radio text-blue-600"
            />
            <span className="text-black">Mail</span>
          </label>
        </div>
        <label className="block mb-4">
          <span className="text-black">Note:</span>
          <textarea
            placeholder="Add a note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          ></textarea>
        </label>
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-2 text-black">Current Status</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setStatus('Verified')}
              className={`px-3 py-1 rounded ${status === 'Verified' ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'}`}
            >
              Verified
            </button>
            <button
              onClick={() => setStatus('In-progress')}
              className={`px-3 py-1 rounded ${status === 'In-progress' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
            >
              In-progress
            </button>
            <button
              onClick={() => setStatus('Pending')}
              className={`px-3 py-1 rounded ${status === 'Pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-black'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatus('Completed')}
              className={`px-3 py-1 rounded ${status === 'Completed' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-black'}`}
            >
              Completed
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-2 text-black">Quotation</h4>
          <label className="block mb-2">
            <span className="text-black">Total:</span>
            <input
              type="text"
              value={totalQuotation}
              onChange={(e) => setTotalQuotation(e.target.value)}
              className="w-full mt-1 p-2 text-black border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block mb-2">
            <span className="text-black">Paid:</span>
            <input
              type="text"
              value={paidQuotation}
              onChange={(e) => setPaidQuotation(e.target.value)}
              className="w-full mt-1 p-2 text-black border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block mb-2">
            <span className="text-black">Left:</span>
            <input
              type="text"
              value={leftQuotation}
              onChange={(e) => setLeftQuotation(e.target.value)}
              className="w-full mt-1 p-2 text-black border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setShowTaskFields(!showTaskFields)}
            className="bg-gray-300 text-black px-4 py-2 rounded shadow"
          >
            Add Task
          </button>
        </div>

        {showTaskFields && (
          <div>
            <h3 className="text-md font-semibold mb-2 text-black">Task Details</h3>
            <label className="block mb-2">
              <span className="text-black">Task Name:</span>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </label>
            <label className="block mb-2">
              <span className="text-black">Description:</span>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              ></textarea>
            </label>
            <label className="block mb-2">
              <span className="text-black">Start Date:</span>
              <input
                type="date"
                value={taskStartDate}
                onChange={(e) => setTaskStartDate(e.target.value)}
                className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </label>
            <label className="block mb-2">
              <span className="text-black">End Date:</span>
              <input
                type="date"
                value={taskEndDate}
                onChange={(e) => setTaskEndDate(e.target.value)}
                className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </label>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded shadow">
            Save
          </button>
          <button onClick={onClose} className="bg-red-600 text-white px-4 py-2 rounded shadow">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPopup;
