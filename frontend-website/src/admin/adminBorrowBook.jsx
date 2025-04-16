import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './adminBookManage.css';
import Sidebar from './sideBar.jsx';
import AddBookPanel from './components/addBookPanel.jsx';
import EditBookPanel from './components/editBookPanel.jsx';

function AdminBookManage() {
    const [error, setError] = useState('');
    const [borrowingRecords, setBorrowingRecords] = useState([]);
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');
    const [searchQuery, setSearchQuery] = useState('');
    const [returnedFilter, setReturnedFilter] = useState(''); // To filter by returned/not returned

    useEffect(() => {
        fetchAcceptedBorrowingRecords();
    }, []);

    const fetchAcceptedBorrowingRecords = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/library/borrowing-records/', { // Your API endpoint for all borrowing records
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            });
            setBorrowingRecords(response.data.borrowingRecords); // Assuming your API returns an object with a 'borrowingRecords' array
        } catch (error) {
            console.error('Error fetching borrowing records:', error);
            setError('Failed to fetch borrowing records.');
        }
    };

    const handleReturnBook = async (recordId) => {
        if (window.confirm(`Are you sure this book has been returned?`)) {
            try {
                // Assuming you have an endpoint to mark a borrowing record as returned
                await axios.patch(`http://127.0.0.1:8000/api/library/borrowing-records/${recordId}/return/`, {}, {
                    headers: {
                        'Authorization': `Token ${authToken}`,
                    },
                });
                console.log(`Borrowing record with ID ${recordId} marked as returned.`);
                fetchAcceptedBorrowingRecords(); // Refresh the list
            } catch (error) {
                console.error(`Error marking borrowing record ${recordId} as returned:`, error);
                setError('Failed to update return status.');
            }
        }
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };

    const handleReturnedFilterChange = (event) => {
        setReturnedFilter(event.target.value);
    };

    const filteredBorrowingRecords = borrowingRecords.filter(record => {
        const searchMatch =
            record.book_title.toLowerCase().includes(searchQuery) ||
            record.user.toLowerCase().includes(searchQuery); // Assuming 'user' is the username

        const returnedMatch =
            returnedFilter === '' ||
            (returnedFilter === 'returned' && record.is_returned) ||
            (returnedFilter === 'not_returned' && !record.is_returned);

        return searchMatch && returnedMatch;
    });

    return (
        <div className='dashboard'>
            <Sidebar />
            <section className='searchBooks'>
                <input
                    className='searchBar'
                    placeholder='Search by Book Title or Borrower'
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <select
                    className='categoryBar'
                    value={returnedFilter}
                    onChange={handleReturnedFilterChange}
                >
                    <option value="">Filter by Returned Status</option>
                    <option value="returned">Returned</option>
                    <option value="not_returned">Not Returned</option>
                </select>
            </section>
            <section className='actions'>
                {error && <p className='error'>{error}</p>}
            </section>
            <section className='booksTable'>
                {!error && filteredBorrowingRecords.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Borrow ID</th>
                                <th>Borrower</th>
                                <th>Title</th>
                                <th>Borrow Date</th>
                                <th>Return Date</th>
                                <th>Returned</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBorrowingRecords.map(record => (
                                <tr key={record.id}>
                                    <td>{record.id}</td>
                                    <td>{record.user}</td>
                                    <td>{record.book_title}</td>
                                    <td>{new Date(record.borrow_date).toLocaleDateString()}</td>
                                    <td>{record.return_date ? new Date(record.return_date).toLocaleDateString() : 'Not Returned'}</td>
                                    <td>{record.is_returned ? 'Yes' : 'No'}</td>
                                    <td>
                                        {!record.is_returned && (
                                            <button className='rtn-btn' onClick={() => handleReturnBook(record.id)}>Mark as Returned</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!error && filteredBorrowingRecords.length === 0 && (
                    <p>No borrowing records found.</p>
                )}
            </section>
        </div>
    );
}

export default AdminBookManage;