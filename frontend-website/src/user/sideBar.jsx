import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './sidebar.css';
import logoImage from '../assets/LOGO_WORD.png'; 

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar">
      <section
              style={{
                backgroundImage: `url(${logoImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '40vh',
                width: '30vh' 
              }}
            ></section>
      <ul>
        <li 
          onClick={() => navigate('/user')}
          className={location.pathname === '/user' ? 'active' : ''}
        >
          USER HOME
        </li>
        <li 
          onClick={() => navigate('/user/bookManage')}
          className={location.pathname === '/user/bookManage' ? 'active' : ''}
        >
          BOOKS
        </li>
        <li 
          onClick={() => navigate('/user/userProfiles')}
          className={location.pathname === '/user/userProfiles' ? 'active' : ''}
        >
          USER PROFILES
        </li>
        <li 
          onClick={() => navigate('/user/historyLogs')}
          className={location.pathname === '/user/historyLogs' ? 'active' : ''}
        >
          HISTORY LOGS
        </li>
        <li 
          onClick={() => navigate('/user/borrowBooks')}
          className={location.pathname === '/user/borrowBooks' ? 'active' : ''}
        >
          BORROW BOOK REQUEST
        </li>
        <li 
          onClick={() => navigate('/user/bookReturn')}
          className={location.pathname === '/user/bookReturn' ? 'active' : ''}
        >
          BOOK RETURN
        </li>
        <li 
          onClick={() => navigate('/user/notification')}
          className={location.pathname === '/user/notification' ? 'active' : ''}
        >
          NOTIFICATION
        </li>
        <li 
          onClick={() => navigate('/user/settings')}
          className={location.pathname === '/user/settings' ? 'active' : ''}
        >
          SETTINGS
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
