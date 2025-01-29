'use client';
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const TodaysTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const isSameDay = (dueDateString) => {
    const today = new Date();
    const dueDate = new Date(dueDateString);
    return (
      today.getFullYear() === dueDate.getFullYear() &&
      today.getMonth() === dueDate.getMonth() &&
      today.getDate() === dueDate.getDate()
    );
  };

  // Fetch current user from Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch tasks from Firestore
  useEffect(() => {
    if (!userId) return;

    const fetchTodaysTasks = async () => {
      try {
        const q = query(collection(db, 'Tasks'), where('By', '==', userId));
        const querySnapshot = await getDocs(q);
        const fetchedTasks = [];
        querySnapshot.forEach((doc) => {
          const taskData = { id: doc.id, ...doc.data() };
          if (isSameDay(taskData.EndDate)) {
            fetchedTasks.push(taskData);
          }
        });
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching today\'s tasks:', error);
      }
    };

    fetchTodaysTasks();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Please log in to view today's tasks.</p>
      </div>
    );
  }

  return (
    <div className="p-1 bg-stone-200 rounded-lg shadow-lg z-[-1]">
      <h2 className="text-2xl font-semibold mb-4 text-black">Today's Tasks</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Task Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Company</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-200">
                <td className="border border-gray-300 px-4 py-2 text-gray-700 font-bold">{task.TaskName}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-700">{task.Description}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-500">{task.Company}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-500">
                  {new Date(task.EndDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="4" className="border border-gray-300 px-4 py-2 text-center text-gray-500">
                  No tasks due today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TodaysTasks;
