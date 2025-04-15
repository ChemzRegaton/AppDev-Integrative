import { useState } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './userUserProfiles.css'
import Sidebar from './sideBar.jsx';

function UserUserProfiles() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  return (
    <div className='dashboard'>
      <Sidebar />
      <h1>This is an user User Profiles!</h1>
    </div>
  );
}

export default UserUserProfiles;
