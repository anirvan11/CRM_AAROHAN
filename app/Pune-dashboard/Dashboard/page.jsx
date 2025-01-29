'use client'
import React from 'react';
import NavBar from '../NavBar/NavBar';
import FollowUpTable from '../../components/followup';
import TodaysTasks from '@/app/components/TodayTask';
import EnquiriesOverview from '@/app/components/EnquiriesOverview';

const Dashboard = () => {
  return (
    <div className="h-screen w-full bg-white overflow-hidden relative">
      <NavBar />
      <div className="flex justify-end h-full">
      <div className="flex-1 p-4">
          <EnquiriesOverview />
        </div>
        <div className="p-4">
          <FollowUpTable />
        </div>
      </div>
      <div className="absolute bottom-10 left-0 p-2">
        <TodaysTasks />
      </div>
    </div>
  );
};

export default Dashboard;
