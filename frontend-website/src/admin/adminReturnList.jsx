import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './sideBar.jsx';
import './adminBorrowBook.css';

function AdminReturnedBook() {
  const [error, setError] = useState('');
  const [returnedRecords, setReturnedRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [returnedBooksCount, setReturnedBooksCount] = useState(0);
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    fetchReturnedBorrowingRecords();
  }, []);

  const fetchReturnedBorrowingRecords = async () => {
    try {
      const response = await axios.get('https://appdev-integrative-28.onrender.com/api/library/borrowing-records/', {
        headers: {
          'Authorization': `Token ${authToken}`,
        },
      });
      const returned = response.data.borrowingRecords.filter(record => record.is_returned);
      setReturnedRecords(returned);
      setReturnedBooksCount(returned.length);
    } catch (error) {
      console.error('Error fetching borrowing records:', error);
      setError('Failed to fetch returned borrowing records.');
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredReturnedRecords = returnedRecords.filter(record =>
    record.book_title.toLowerCase().includes(searchQuery) ||
    record.user.toLowerCase().includes(searchQuery)
  );

  return (
    <div className='dashboard'>
      <Sidebar />
      <section className='searchBooks' style={{ display: 'flex', marginBottom: '40px' }}>
        <input
          className='searchBar'
          placeholder='Search by Book Title or Borrower'
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <section className='totalBorrowed' style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <p className='label' style={{ color: 'black' }}>Returned Books</p>
          <p className='label' style={{ fontSize: '100px', marginTop: '-10px' }}>{returnedBooksCount}</p>
        </section>
      </section>

      <section className='borrowedBooksTable'>
        {!error && filteredReturnedRecords.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Borrow ID</th>
                <th>Borrower</th>
                <th>Title</th>
                <th>Borrow Date</th>
                <th>Return Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturnedRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.user}</td>
                  <td>{record.book_title}</td>
                  <td>{new Date(record.borrow_date).toLocaleDateString()}</td>
                  <td>{new Date(record.return_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!error && filteredReturnedRecords.length === 0 && (
          <p>No returned books found.</p>
        )}
      </section>
    </div>
  );
}

export default AdminReturnedBook;
