import { useState } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './userHistoryLogs.css'
import Sidebar from './sideBar.jsx';

function UserHistoryLogs() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  return (
    <div className='dashboard'>
      <Sidebar />
      <h1>This is an user History Logs!</h1>
    </div>
  );
}

export default UserHistoryLogs;
