import { useState } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './userSettings.css'
import Sidebar from './sideBar.jsx';

function UserSettings() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };
  

  return (
    <div className='dashboard'>
      <Sidebar />
      <h1>Are you sure you want to log out!</h1>
      <button onClick={handleLogout}>YES</button>
    </div>
  );
}

export default UserSettings;
