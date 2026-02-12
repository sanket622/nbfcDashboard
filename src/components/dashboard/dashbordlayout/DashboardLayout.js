import React, { useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Navbar from '../../Navbar';
import DashboardHeader from './DashboardHeader';
import Employees from '../manageroles/ManageRoles';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonIcon from '@mui/icons-material/Person';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageEmployer from '../manageroles/ManageRoles';
import ManageRoles from '../manageroles/ManageRoles';
import ManageRequest from '../managerequest/ManageRequest';
import ViewProduct from '../managerequest/ViewProduct';



const DashboardLayout = () => {


  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const TABS = [
    { label: "Dashboard", path: 'home', icon: <DashboardIcon />, outlinedIcon: <DashboardOutlinedIcon />, component: <DashboardHeader /> },
    // { label: "Manage Employer", path: 'manageemployer', icon: <PersonIcon />, outlinedIcon: <PersonOutlineIcon />,  },
    { label: "Manage Roles", path: 'manageroles', icon: <PeopleAltIcon />, outlinedIcon: <PeopleOutlineOutlinedIcon />, component: <ManageRoles /> },
    { label: "Manage Request", path: 'managerequest', icon: <PeopleAltIcon />, outlinedIcon: <PeopleOutlineOutlinedIcon />, component: <ManageRoles /> },
    // { label: "Analytics", path: 'analytics', icon: <AnalyticsIcon />, outlinedIcon: <AnalyticsOutlinedIcon />, },
    // { label: "System Config.", path: 'systemconfig.', icon: <SettingsIcon />, outlinedIcon: <SettingsOutlinedIcon />, },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const SIDEBAR_WIDTH = 250;
  return (
    <div className="flex bg-gray-50" style={{ height: '100vh' }}>
      <Navbar />
      <div
        className={`bg-white shadow-lg text-black font-semibold text-[16px] px-4 pb-2 z-50
  w-[${SIDEBAR_WIDTH}px] h-screen overflow-y-auto fixed top-[70px] left-0 
  transform transition-transform duration-300
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  md:translate-x-0`}
      >
        <ul className="space-y-3 mt-6">
          {TABS.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <li
                key={item.path}
                onClick={() => navigate(`/${item.path}`)}
                className={`relative flex items-center px-5 py-2.5 cursor-pointer gap-3 transition-all ${isActive
                  ? 'bg-[#0000FF] font-medium rounded-md text-white'
                  : 'hover:bg-[#0000FF]/10 hover:text-[#0000FF] text-[#5B5B5B] rounded-xl'
                  }`}
              >
                <span>{isActive ? item.icon : item.outlinedIcon}</span>
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className={`flex-1 p-6 min-h-screen overflow-y-auto bg-gray-50 transition-all duration-300
  ${sidebarOpen ? `ml-[${SIDEBAR_WIDTH}px]` : 'ml-0 md:ml-[250px]'}`}
        style={{ marginTop: "70px" }}
      >
        <div className="w-full relative">
          <div className="flex justify-end items-center">
            <button className="md:hidden text-black" onClick={toggleSidebar}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>


          <Routes>
            <Route path="/home" element={<DashboardHeader />} />
            <Route path="/manageroles" element={<ManageRoles />} />
            <Route path="/managerequest" element={<ManageRequest />} />
            <Route path="/viewproducteditdetail/:id" element={<ViewProduct />} />


            {/* <Route path="/employees/:id" element={<EmployeeDetailsCard />} /> */}
          </Routes>

        </div>
      </div>
    </div>

  );
};

export default DashboardLayout;