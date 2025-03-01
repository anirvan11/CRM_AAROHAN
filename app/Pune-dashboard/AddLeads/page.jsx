'use client'
import React from 'react';
import AddEmployeeCustomer from '@/app/components/EmployeeCreateCustomer';
import NavBar from '../NavBar/NavBar';

const AddLeads = () => {
  return (
    <div className="h-screen w-full bg-white overflow-auto">
      <NavBar />
    <div className='h-screen w-full bg-white'>
      <AddEmployeeCustomer/>
    </div>
    </div>
  );
};

export default AddLeads;
