import { useState } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './userBorrowBook.css';
import Sidebar from './sideBar.jsx';

function AdminNotification() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  return (
    <div className='dashboard' style={{ display: 'block' }}>
      <Sidebar />
      <section className='policy'>
        <section className='policy-terms-container'>

          <p><strong>Borrowing Policy</strong></p>
          <ul>
            <li><strong>Eligibility:</strong> Only registered users (students, faculty, staff) can borrow materials.</li>
            <li><strong>Loan Limits:</strong> Limits on the number of books/items a user can borrow at one time.</li>
            <li><strong>Loan Duration:</strong> Time period for borrowing (e.g., 7 days for students, 14 for faculty).</li>
            <li><strong>Renewals:</strong> Conditions under which an item can be renewed (e.g., not reserved by others).</li>
          </ul>

          <p><strong>Return and Overdue Policy</strong></p>
          <ul>
            <li><strong>Return Deadlines:</strong> Materials must be returned on or before the due date.</li>
            <li><strong>Overdue Fines:</strong> Penalties for late returns (e.g., ₱5/day per book).</li>
            <li><strong>Lost/Damaged Items:</strong> Users are charged replacement costs plus processing fees.</li>
          </ul>

          <p><strong>Account and Usage Policy</strong></p>
          <ul>
            <li>Each user is responsible for their own account and borrowed materials.</li>
            <li>Do not share your login credentials.</li>
            <li>Report any unauthorized access immediately.</li>
          </ul>

          <p><strong>Conduct Policy</strong></p>
          <ul>
            <li>Treat library materials and systems with care.</li>
            <li>Respect fellow users and avoid disruptive behavior.</li>
            <li>Chat or feedback tools must be used respectfully and constructively.</li>
          </ul>

          <p><strong>Privacy and Security Policy</strong></p>
          <ul>
            <li>User information is confidential and protected.</li>
            <li>Data will only be used for library operations and improvements.</li>
            <li>The system uses secure login and encrypted data.</li>
          </ul>
        </section>
      </section>
    </div>
  );
}

export default AdminNotification;
