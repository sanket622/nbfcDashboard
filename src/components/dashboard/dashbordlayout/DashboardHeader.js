import React from 'react';
import { Card, CardContent, Divider } from '@mui/material';
import { CalendarMonth, ArrowForwardIos } from '@mui/icons-material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useState } from 'react';

import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTotalEmployeeCard } from '../../../redux/dashboardhome/cardSlice';
import { useEffect } from 'react';


export default function Dashboard() {

    const dispatch = useDispatch();
    const totalEmployees = useSelector(state => state.employeeCard.totalEmployees);
    const totalApplicants = useSelector(state => state.employeeCard.totalApplicants);
    const loading = useSelector(state => state.employeeCard.loading);

    // useEffect(() => {
    //     dispatch(fetchTotalEmployeeCard());
    // }, [dispatch]);

    // const [userData] = useState({ name: 'Abhiraj', employees: 560, employeeGrowth: 12, applicants: 1050, applicantGrowth: 5, lastUpdate: 'April 14, 2025' });

    return (
        <>
            <h1 className='text-3xl font-semibold mb-4'>Dashboard</h1>
            <div className=" min-h-screen flex flex-col items-center">
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* Profile Card */}
                    <div className="col-span-1 flex justify-center">
                        <div className="bg-white  h-[350px] w-[323px] shadow-md p-6 flex flex-col items-center text-center ">
                            <div className="bg-gray-100 rounded-full w-48 h-48 mb-6 overflow-hidden flex items-center justify-center">
                                <img
                                    src=''
                                    alt="Profile avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h2 className="text-[#1f2937] text-[18px] font-semibold mb-2">Hello!</h2>
                            <p className="text-[#8A8A8A] text-[12px]">Good Morning! You have new messages. It's a lot of work today! So let's get started.</p>
                        </div>
                    </div>

                    {/* Stats Column */}
                    <div className="col-span-1 flex flex-col gap-6 ">
                        {/* Employees Card */}
                        <div className="bg-white rounded-xl shadow-md">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                                        <GroupsOutlinedIcon style={{ color: '#6366f1', fontSize: 24 }} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">Total Employee</h3>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h2 className="text-4xl font-bold text-gray-900">
                                        {loading ? 'Loading...' : totalEmployees}
                                    </h2>
                                    {/* Replace with actual growth data if available */}
                                    <div className="bg-green-100 text-green-600 py-1 px-3 rounded-full flex items-center">
                                        <ArrowUpwardIcon style={{ fontSize: 16, marginRight: 4 }} />
                                        <span>12%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Applicants Card */}
                        <div className="bg-white rounded-xl shadow-md ">
                            <div className=" p-6">
                                <div className="flex items-center mb-4">
                                    <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                                        <BusinessCenterOutlinedIcon style={{ color: '#6366f1', fontSize: 24 }} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">Total Applicant</h3>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h2 className="text-4xl font-bold text-gray-900">
                                        {loading ? 'Loading...' : totalApplicants}
                                    </h2>
                                    {/* Replace with actual growth data if available */}
                                    <div className="bg-green-100 text-green-600 py-1 px-3 rounded-full flex items-center">
                                        <ArrowUpwardIcon style={{ fontSize: 16, marginRight: 4 }} />
                                        <span>12%</span>
                                    </div>
                                </div>
                            </div>
                            {/* <Divider className='w-full'/>
                        <p className="text-gray-400 mt-4 px-6 pb-3">Update: {userData.lastUpdate}</p> */}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-1 flex flex-col gap-6">
                        {/* Calendar Card */}
                        <Card className="rounded-xl shadow-md">
                            <CardContent>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-[16px]">Holidays</h3>
                                    <CalendarMonth className="text-[#7152F3]" />
                                </div>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateCalendar className="w-full" />
                                </LocalizationProvider>
                                <ul className="mt-4 text-sm text-gray-700">
                                    <li><strong>Friday, 15 April 2025</strong><br />Jayanti</li>
                                    <li className="mt-2"><strong>Monday, 18 April 2025</strong><br />Jayanti</li>
                                    <li className="mt-2"><strong>Friday, 22 April 2025</strong><br />Jayanti</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* What's New Card */}
                        <Card className="rounded-xl shadow-md">
                            <CardContent>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold">What’s New</h3>
                                    <span className="text-[14px] text-[#1f2937] flex items-center gap-1 cursor-pointer">
                                        View all <ArrowForwardIos fontSize="inherit" />
                                    </span>
                                </div>
                                {[1, 2].map((item) => (
                                    <div key={item} className="mb-4">
                                        <div className="bg-gray-200 h-16 rounded mb-2"></div>
                                        <p className="text-[14px] text-[#1f2937] font-medium">
                                            New Feature Update <span className="text-gray-400 ml-2 text-[14px]">• 3 hours ago</span>
                                        </p>
                                        <p className="text-[14px] text-black mt-1">
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
