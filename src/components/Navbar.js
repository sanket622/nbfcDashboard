import * as React from 'react';
import logo from '../assets/AppIcons.svg';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Avatar, IconButton } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/auth/authSlice';
import { fetchRoles } from "../redux/managerole/roleModuleSlice";

function Navbar() {

  const [language, setLanguage] = React.useState('en');
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const handleClick = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleClose = () => {
    setMenuOpen(false);
  };

  const dispatch = useDispatch();

  const handleMenuItemClick = (setting) => {
    switch (setting) {
      case 'Logout':
        dispatch(logout());
        navigate('/login', { replace: true });
        break;
      default:
        break;
    }
    handleClose();
  };

  const BellIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-black"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      // Token not found: redirect to login
      navigate('/login', { replace: true });
      return;
    }

    // Call API
    const fetchUserRoles = async () => {
      try {
        await dispatch(fetchRoles());
      } catch (err) {
        console.error('Error fetching roles:', err);

        // If axios error and has status code
        if (err?.response && (err?.response?.status === 401)) {
          dispatch(logout());
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
        }
      }
    };

    fetchUserRoles();
  }, [dispatch, navigate]);


  return (
    <div className="bg-white w-full shadow-md fixed top-0 left-0  h-[70px] flex items-center px-6 z-50">
      <div className="flex justify-between items-center w-full px-6">
        <img src={logo} alt="logo" className="h-10" />
        {/* <div className="flex items-center cursor-pointer" onClick={toggleLanguage}>
        </div> */}

        <div className="flex items-center space-x-4">
          <div className="relative mr-2">
            <IconButton className="p-2">
              <BellIcon />
              {/* Red notification dot */}
              <span className="absolute top-1 right-2 bg-red-500 rounded-full h-2 w-2"></span>
            </IconButton>
          </div>
          {/* Profile dropdown */}
          <div className="relative">
            <div
              className="flex items-center cursor-pointer py-4 mr-6"
              onClick={handleClick}
            >
              {/* Profile Avatar */}
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                alt="Main Admin"
                className="h-12 w-12 mr-1"
              />

              {/* Admin Text */}
              {/*<span className="text-black font-semibold text-xl mr-0">*/}
              {/*  Abhiraj*/}
              {/*</span>*/}

              {/* Dropdown Arrow */}
              <ArrowDropDownIcon className="text-gray-700 h-8 w-8" />
            </div>

            {menuOpen && (
              <div className="absolute top-16 right-2 w-40 bg-white rounded-lg shadow-lg border z-50 mr-2">
                {/* Triangle Pointer */}
                <div className="absolute -top-2 right-12 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-200 z-10"></div>

                {/* Menu Items */}

                <div
                  onClick={() => handleMenuItemClick('Logout')}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                >
                  <LogoutIcon className="text-gray-700" />
                  <span className="text-sm text-gray-800">Logout</span>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Navbar;
