import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './userBookManage.css';
import Sidebar from './sideBar.jsx';
import Message from './components/message.jsx'; // Import the Message component

function UserBookManage() {
    const [error, setError] = useState('');
    const [books, setBooks] = useState([]);
    const [totalBookQuantity, setTotalBookQuantity] = useState(0);
    const [isAddBookPanelVisible, setIsAddBookPanelVisible] = useState(false);
    const [isEditBookPanelVisible, setIsEditBookPanelVisible] = useState(false);
    const [editingBookId, setEditingBookId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken'); // Get the auth token
    const [generalMessage, setGeneralMessage] = useState(''); // State for dynamic messages
    const [isGeneralMessageVisible, setIsGeneralMessageVisible] = useState(false); // Control visibility of general message
    const [requestCount, setRequestCount] = useState(parseInt(localStorage.getItem('requestCount')) || 0); // Shared request count

    useEffect(() => {
        fetchBooks();
        const storedRequestCount = parseInt(localStorage.getItem('requestCount')) || 0;
        setRequestCount(storedRequestCount);
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await axios.get('https://appdev-integrative-28.onrender.com/api/library/books/');
            setBooks(response.data.books);
            const totalQuantity = response.data.books.reduce((sum, book) => sum + book.quantity, 0);
            setTotalBookQuantity(totalQuantity);
        } catch (error) {
            console.error('Error fetching books:', error);
            setError('Failed to fetch books.');
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (window.confirm(`Are you sure you want to delete book with ID: ${bookId}?`)) {
            try {
                await axios.delete(`https://appdev-integrative-28.onrender.com/api/library/books/${bookId}/`);
                console.log(`Book with ID ${bookId} deleted successfully.`);
                fetchBooks();
                setGeneralMessage('Book deleted successfully!');
                setIsGeneralMessageVisible(true);
            } catch (error) {
                console.error(`Error deleting book with ID ${bookId}:`, error);
                setError('Failed to delete book.');
                setGeneralMessage('Failed to delete book.');
                setIsGeneralMessageVisible(true);
            }
        }
    };

    const handleAddBookClick = () => {
        setIsAddBookPanelVisible(true);
    };

    const handleCloseAddBookPanel = () => {
        setIsAddBookPanelVisible(false);
        fetchBooks();
    };

    const handleEditBook = (bookId) => {
        setEditingBookId(bookId);
        setIsEditBookPanelVisible(true);
    };

    const handleCloseEditBookPanel = () => {
        setIsEditBookPanelVisible(false);
        setEditingBookId(null);
        fetchBooks();
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };

    const handleCategoryChange = (event) => {
        setCategoryFilter(event.target.value.toLowerCase());
    };

    const handleCloseGeneralMessage = () => {
        setIsGeneralMessageVisible(false);
        setGeneralMessage(''); // Clear the message after closing
    };

    const handleSendRequest = async (bookId, availableQuantity) => {
        console.log('handleSendRequest called from UserBookManage');
        let currentRequestCount = parseInt(localStorage.getItem('requestCount')) || 0;
        console.log('handleSendRequest - Current requestCount from localStorage:', currentRequestCount);

        if (!authToken) {
            console.error('Authentication token not found.');
            setError('You must be logged in to send a request.');
            setGeneralMessage('You must be logged in to send a request.');
            setIsGeneralMessageVisible(true);
            return;
        }

        if (availableQuantity <= 0) {
            setGeneralMessage('This book is currently unavailable.');
            setIsGeneralMessageVisible(true);
            return;
        }

        if (currentRequestCount >= 3) {
            setGeneralMessage(<span style={{ color: 'orange' }}>You can only send up to 3 book requests.</span>);
            setIsGeneralMessageVisible(true);
            return;
        }

        try {
            const response = await axios.post(
                'https://appdev-integrative-28.onrender.com/api/library/requests/',
                { book: bookId },
                {
                    headers: {
                        'Authorization': `Token ${authToken}`,
                    },
                }
            );
            console.log('handleSendRequest - Borrow request sent successfully:', response.data);

            const newRequestCount = currentRequestCount + 1;
            localStorage.setItem('requestCount', newRequestCount);
            setRequestCount(newRequestCount); // Update the state

            setGeneralMessage(`Your request for "${response.data.book_detail.title}" was sent.`);
            setIsGeneralMessageVisible(true);
        } catch (error) {
            console.error('handleSendRequest - Error sending borrow request:', error);
            setGeneralMessage('Failed to send request.');
            setIsGeneralMessageVisible(true);
            if (error.response && error.response.status === 401) {
                setError('You are not authorized to perform this action.');
                setGeneralMessage('You are not authorized to perform this action.');
                setIsGeneralMessageVisible(true);
            }
        }
    };

    const filteredBooks = books.filter(book => {
        const searchMatch =
            book.title.toLowerCase().includes(searchQuery) ||
            book.author.toLowerCase().includes(searchQuery) ||
            book.book_id.toLowerCase().includes(searchQuery) ||
            (book.publisher && book.publisher.toLowerCase().includes(searchQuery));

        const categoryMatch =
            !categoryFilter || book.category.toLowerCase().includes(categoryFilter);

        return searchMatch && categoryMatch;
    });
    return (
        <div className='dashboard'>
            <Sidebar />
            <section className='searchBooks'>
                <input
                    className='searchBar'
                    placeholder='Search Book (Title, Author, ID, Publisher)'
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <input
                    className='categoryBar'
                    placeholder='Filter by Category'
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                />
                <section className='totalBooks'>
                    <p className='label' style={{ alignSelf: 'flex-start' }}>Total Books</p>
                    <p className='label' style={{ alignSelf: 'flex-start', fontSize: '80px', marginTop: '-20px' }}>{totalBookQuantity}</p>
                </section>
            </section>
            <section className='actions'>
                {/* Add any admin-specific action buttons here if needed */}
            </section>
            <section className='booksTable'>
                {error && <p className='error'>{error}</p>}
                {!error && filteredBooks.length > 0 && (
                    <table>
                        <thead>
                            <tr className='head'>
                                <th>Cover</th> {/* New column for cover image */}
                                <th>Book ID</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Yr. Published</th>
                                <th>Publisher</th>
                                <th>Category</th>
                                <th>Date Added</th>
                                <th>Quantity</th>
                                <th>Available</th>
                                <th>Location</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBooks.map(book => (
                                <tr key={book.book_id}>
                                    <td>
                                        {book.cover_image && (
                                            <img
                                                src={book.cover_image}
                                                alt={`Cover of ${book.title}`}
                                                style={{ width: '50px', height: '70px', objectFit: 'cover' }}
                                            />
                                        )}
                                        {!book.cover_image && (
                                            <span>No Cover</span>
                                        )}
                                    </td>
                                    <td>{book.book_id}</td>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>{book.publication_year}</td>
                                    <td>{book.publisher}</td>
                                    <td>{book.category}</td>
                                    <td>{new Date(book.date_added).toLocaleDateString()}</td>
                                    <td>{book.quantity}</td>
                                    <td>{book.available_quantity}</td>
                                    <td>{book.location}</td>
                                    <td>
                                        <button
                                            className='borrow-btn'
                                            onClick={() => handleSendRequest(book.book_id, book.available_quantity)}
                                            disabled={book.available_quantity <= 0}
                                            style={{
                                                opacity: book.available_quantity <= 0 ? 0.6 : 1,
                                                cursor: book.available_quantity <= 0 ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {book.available_quantity <= 0 ? 'Unavailable' : 'Request'}
                                        </button>
                                        {/* Keep the Edit and Delete buttons as they are */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!error && filteredBooks.length === 0 && (
                    <p>No books found matching your search criteria.</p>
                )}
            </section>

            {isAddBookPanelVisible && (
                <AddBookPanel onClose={handleCloseAddBookPanel} />
            )}
            {isEditBookPanelVisible && (
                <EditBookPanel bookId={editingBookId} onClose={handleCloseEditBookPanel} />
            )}
            {isGeneralMessageVisible && (
                <Message message={generalMessage} onClose={handleCloseGeneralMessage} />
            )}
        </div>
    );
}

export default UserBookManage;