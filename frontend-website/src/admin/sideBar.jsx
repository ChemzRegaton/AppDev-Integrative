  import React from 'react';
  import { useNavigate, useLocation } from 'react-router-dom';
  import './sidebar.css';
  import logoImage from '../assets/LOGO_WORD2.png'; 

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
                  height: '22vh',
                  width: '20vh',
                  display: 'flex',
        
                }}
              ></section>
        <ul>
          <li 
            onClick={() => navigate('/admin')}
            className={location.pathname === '/admin' ? 'active' : ''}
          >
            ADMIN DASHBOARD
          </li>
          <li 
            onClick={() => navigate('/admin/bookManage')}
            className={location.pathname === '/admin/bookManage' ? 'active' : ''}
          >
            BOOK MANAGEMENT
          </li>
          <li 
            onClick={() => navigate('/admin/userProfiles')}
            className={location.pathname === '/admin/userProfiles' ? 'active' : ''}
          >
            USER PROFILES
          </li>
          <li 
            onClick={() => navigate('/admin/borrowBooks')}
            className={location.pathname === '/admin/borrowBooks' ? 'active' : ''}
          >
            BORROWED BOOK
          </li>
          <li 
            onClick={() => navigate('/admin/bookReturnList')}
            className={location.pathname === '/admin/bookReturnList' ? 'active' : ''}
          >
            RETURNED BOOKS
          </li>

          <li 
            onClick={() => navigate('/admin/bookReturn')}
            className={location.pathname === '/admin/bookReturn' ? 'active' : ''}
          >
            PENDING REQUEST
          </li>
          <li 
            onClick={() => navigate('/admin/notification')}
            className={location.pathname === '/admin/notification' ? 'active' : ''}
          >
            INBOX
          </li>
          <li 
            onClick={() => navigate('/admin/historyLogs')}
            className={location.pathname === '/admin/historyLogs' ? 'active' : ''}
          >
            ABOUT US
          </li>
          <li 
            onClick={() => navigate('/admin/settings')}
            className={location.pathname === '/admin/settings' ? 'active' : ''}
          >
            LOG OUT
          </li>
        </ul>
      </div>
    );
  };

  export default Sidebar;
