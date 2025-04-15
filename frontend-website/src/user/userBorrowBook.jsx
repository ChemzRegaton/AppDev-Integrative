import { useState } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './userBorrowBook.css'
import Sidebar from './sideBar.jsx';

function UserBorrowBook() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  return (
    <div className='dashboard'>
      <Sidebar />
      <h1>This is an user Borrow Books!</h1>
    </div>
  );
}

export default UserBorrowBook;
