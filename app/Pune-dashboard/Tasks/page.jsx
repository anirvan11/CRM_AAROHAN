'use client';
import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import NavBar from '../NavBar/NavBar';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false); // Add Task Modal toggle
  const [newTask, setNewTask] = useState({
    TaskName: '',
    Description: '',
    StartDate: '',
    EndDate: '',
    Company: '',
  });

  // Fetch current user from Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Set the current user's UID
      } else {
        setUserId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch tasks from Firestore for the logged-in user
  useEffect(() => {
    if (!userId) return;

    const fetchTasks = async () => {
      try {
        const q = query(collection(db, 'Tasks'), where('By', '==', userId));
        const querySnapshot = await getDocs(q);
        const fetchedTasks = [];
        querySnapshot.forEach((doc) => {
          fetchedTasks.push({ id: doc.id, ...doc.data() });
        });
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [userId]);

  const handleAddTask = async () => {
    if (!newTask.TaskName || !newTask.Description || !newTask.StartDate || !newTask.EndDate || !newTask.Company) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const taskData = {
        ...newTask,
        By: userId,
        Status: 'Not finished',
      };

      // Add new task to Firestore
      const docRef = await addDoc(collection(db, 'Tasks'), taskData);

      // Update local state with the new task
      setTasks((prevTasks) => [...prevTasks, { id: docRef.id, ...taskData }]);

      // Reset form and close modal
      setNewTask({ TaskName: '', Description: '', StartDate: '', EndDate: '', Company: '' });
      setShowAddTaskModal(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleFinishTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'Tasks', taskId);

      // Update the task's status to "Finished"
      await updateDoc(taskRef, { Status: 'Finished' });

      // Delete the task from Firebase
      await deleteDoc(taskRef);

      // Remove the task from the local state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error finishing task:', error);
    }
  };

  const isSameDay = (dueDateString) => {
    const today = new Date();
    const due = new Date(dueDateString); // Parse the string into a Date object

    if (isNaN(due)) {
      console.error(`Invalid date format: ${dueDateString}`);
      return false;
    }

    return (
      today.getFullYear() === due.getFullYear() &&
      today.getMonth() === due.getMonth() &&
      today.getDate() === due.getDate()
    );
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p>Please log in to view your tasks.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white overflow-hidden">
      <NavBar />
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            className="bg-blue-900 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            onClick={() => setShowAddTaskModal(true)}
          >
            Add Task
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Due Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Task</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Company</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className={`${
                    isSameDay(task.EndDate) ? 'bg-red-100' : task.Status === 'Finished' ? 'bg-green-100' : 'bg-white'
                  } hover:bg-gray-200`}
                >
                  <td className="border border-gray-300 px-4 py-2 text-gray-500">
                    {new Date(task.EndDate).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700 font-bold">{task.TaskName}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">{task.Description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-500">{task.Status}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-500">{task.Company}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-lg"
                      onClick={() => handleFinishTask(task.id)}
                    >
                      Finished
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                  >
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddTaskModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[40rem]">
            <h2 className="text-xl font-bold mb-4 text-black">Add Task</h2>
            <label className="block mb-4">
              <span className="text-black">Task Name:</span>
              <input
                type="text"
                value={newTask.TaskName}
                onChange={(e) => setNewTask({ ...newTask, TaskName: e.target.value })}
                className="w-full text-black mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block mb-4">
              <span className="text-black">Description:</span>
              <textarea
                value={newTask.Description}
                onChange={(e) => setNewTask({ ...newTask, Description: e.target.value })}
                className="w-full text-black mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </label>
            <label className="block mb-4">
              <span className="text-black">Start Date:</span>
              <input
                type="date"
                value={newTask.StartDate}
                onChange={(e) => setNewTask({ ...newTask, StartDate: e.target.value })}
                className="w-full text-black mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block mb-4">
              <span className="text-black">End Date:</span>
              <input
                type="date"
                value={newTask.EndDate}
                onChange={(e) => setNewTask({ ...newTask, EndDate: e.target.value })}
                className="w-full text-black mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block mb-4">
              <span className="text-black">Company Name:</span>
              <input
                type="text"
                value={newTask.Company}
                onChange={(e) => setNewTask({ ...newTask, Company: e.target.value })}
                className="w-full text-black mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAddTask}
                className="bg-green-600 text-white px-4 py-2 rounded shadow"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
