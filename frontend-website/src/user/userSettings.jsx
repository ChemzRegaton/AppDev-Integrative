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
    navigate('/login');
  };
  

  return (
    <div className='dashboard'>
      <Sidebar />
      <h1>This is an user Settings!</h1>
      <button onClick={handleLogout}>LOG OUT</button>
    </div>
  );
}

export default UserSettings;
