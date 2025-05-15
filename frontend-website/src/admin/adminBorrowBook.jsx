// In AdminBorrowBook.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './adminBorrowBook.css'; // Corrected import path
import Sidebar from './sideBar.jsx';
import Message from './components/message.jsx'; // Adjust path as needed
import AddBookPanel from './components/addBookPanel.jsx';
import EditBookPanel from './components/editBookPanel.jsx';
import { FaCheckCircle } from 'react-icons/fa'; // Import the check circle icon

function AdminBorrowBook({ onBookReturned }) { // Receive the refresh function as a prop
    const [error, setError] = useState('');
    const [borrowingRecords, setBorrowingRecords] = useState([]);
    const [borrowedBooksCount, setBorrowedBooksCount] = useState(0); // New state for borrowed book count
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');
    const [searchQuery, setSearchQuery] = useState('');
    const [messageText, setMessageText] = useState('');
    const [isMessageVisible, setIsMessageVisible] = useState(false);


    const fetchAcceptedBorrowingRecords = async () => {
        try {
            const response = await axios.get('https://appdev-integrative-28.onrender.com/api/library/borrowing-records/', { // Fetch all borrowing records
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            });
            const activeBorrows = response.data.borrowingRecords.filter(record => !record.is_returned);
            setBorrowingRecords(activeBorrows);
            setBorrowedBooksCount(activeBorrows.length); // Set the count of currently borrowed books
        } catch (error) {
            console.error('Error fetching borrowing records:', error);
            setError('Failed to fetch borrowing records.');
        }
    };

    useEffect(() => {
        fetchAcceptedBorrowingRecords();
    }, []);

    const handleReturnBook = async (recordId, bookId, borrowerUsername) => {
        try {
            const response = await axios.patch(
                `https://appdev-integrative-28.onrender.com/api/library/borrowing-records/${recordId}/return/`,
                {},
                {
                    headers: {
                        'Authorization': `Token ${authToken}`,
                    },
                }
            );
            console.log(`Borrowing record with ID ${recordId} marked as returned:`, response.data);
            // Remove the returned record from the local state
            setBorrowingRecords(borrowingRecords.filter(record => record.id !== recordId));
            setBorrowedBooksCount(borrowedBooksCount - 1);
            setMessageText(response.data.message);
            setIsMessageVisible(true);

            if (onBookReturned) {
                onBookReturned(); // Call the function passed from UserHome
            }
        } catch (error) {
            console.error(`Error marking borrowing record ${recordId} as returned:`, error);
            setError('Failed to update return status.');
            
        }
    };
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };

    const handleCloseMessage = () => {
        setIsMessageVisible(false);
        setMessageText('');
    };


    const filteredBorrowingRecords = borrowingRecords.filter(record => {
        const searchMatch =
            record.book_title.toLowerCase().includes(searchQuery) ||
            record.user.toLowerCase().includes(searchQuery); // Assuming 'user' is the username

        return searchMatch;
    });

    const calculateDueDateInfo = (borrowDate, returnDate) => {
        const today = new Date();
        const due = new Date(returnDate); // Assuming returnDate is the due date
        const timeDifference = due.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));

        if (daysLeft >= 0) {
            return { text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, overdue: false };
        } else {
            const daysPassed = Math.abs(daysLeft);
            return { text: `${daysPassed} day${daysPassed !== 1 ? 's' : ''} overdue`, overdue: true };
        }
    };

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
                    <p className='label' style={{ color: 'black' }}>Borrowed Books</p>
                    <p className='label' style={{ fontSize: '100px', marginTop: '-10px' }}>{borrowedBooksCount}</p>
                </section>
            </section>
            <section className='borrowedBooksTable'>
                {!error && filteredBorrowingRecords.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Borrow ID</th>
                                <th>Borrower</th>
                                <th>Title</th>
                                <th>Borrow Date</th>
                                <th>Due Date</th> {/* Renamed to Due Date */}
                                <th>Due Date Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBorrowingRecords.map(record => {
                                const dueDateInfo = calculateDueDateInfo(record.borrow_date, record.return_date); // Using return_date as due date
                                return (
                                    <tr key={record.id} className={dueDateInfo.overdue ? 'overdue-row' : ''}>
                                        <td>{record.id}</td>
                                        <td>{record.user}</td>
                                        <td>{record.book_title}</td>
                                        <td>{new Date(record.borrow_date).toLocaleDateString()}</td>
                                        <td>{new Date(record.return_date).toLocaleDateString()}</td> {/* Displaying return_date as due date */}
                                        <td>
                                            {!record.is_returned && (
                                                <span className={dueDateInfo.overdue ? 'overdue-text' : 'due-date-text'}>
                                                    {dueDateInfo.text}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {!record.is_returned && (
                                                <button
                                                    className='rtn-btn'
                                                    onClick={() => handleReturnBook(record.id, record.book_id, record.user)}
                                                >
                                                    <FaCheckCircle className='return-icon' /> Mark as Returned
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
                {!error && filteredBorrowingRecords.length === 0 && (
                    <p>No active borrowing records found.</p>
                )}
                {isMessageVisible && (
                    <Message message={messageText} onClose={handleCloseMessage} />
                )}

            </section>
        </div>
    );
}

export default AdminBorrowBook;