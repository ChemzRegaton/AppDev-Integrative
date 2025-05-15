import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './adminBookManage.css';
import Sidebar from './sideBar.jsx';
import AddBookPanel from './components/addBookPanel.jsx';
import EditBookPanel from './components/editBookPanel.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

function AdminBookManage() {
    const [error, setError] = useState('');
    const [books, setBooks] = useState([]);
    const [totalBookQuantity, setTotalBookQuantity] = useState(0);
    const [isAddBookPanelVisible, setIsAddBookPanelVisible] = useState(false);
    const [isEditBookPanelVisible, setIsEditBookPanelVisible] = useState(false);
    const [editingBookId, setEditingBookId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
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
            } catch (error) {
                console.error(`Error deleting book with ID ${bookId}:`, error);
                setError('Failed to delete book.');
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

    const handleBorrowBook = async (bookId) => {
        const token = localStorage.getItem('authToken'); // Assuming you store it in localStorage
        if (!token) {
            console.error('Authentication token not found.');
            setError('You must be logged in to borrow a book.');
            return;
        }
        window.confirm(`Are you sure you want to borrow book with ID: ${bookId}?`)

        try {
            const response = await axios.post(
                `https://appdev-integrative-28.onrender.com/api/library/books/${bookId}/borrow/`,
                {}, // You might not need a body for a simple borrow action
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                }
            );
            console.log(response.data.message);
            console.log('Borrowing Record:', response.data.borrowing_record);
            setError('');
            fetchBooks();
        } catch (error) {
            console.error('Error borrowing book:', error);
            setError('Failed to borrow book.');
            if (error.response && error.response.status === 401) {
                setError('You are not authorized to perform this action.');
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
                <button className='btn' onClick={handleAddBookClick}>
                    <FontAwesomeIcon icon={faPlus} className='add-icon' /> Add New Book
                </button>
            </section>
            <section className='adminBooksTable'> {/* Changed class name here */}
                {error && <p className='error'>{error}</p>}
                {!error && filteredBooks.length > 0 && (
                    <table>
                        <thead>
                            <tr>
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
                                    <td>{book.book_id}</td>
                                    <td style={{ textWrap: 'wrap' }}>{book.title}</td>
                                    <td style={{ textWrap: 'wrap' }}>{book.author}</td>
                                    <td>{book.publication_year}</td>
                                    <td>{book.publisher}</td>
                                    <td>{book.category}</td>
                                    <td>{new Date(book.date_added).toLocaleDateString()}</td>
                                    <td>{book.quantity}</td>
                                    <td>{book.available_quantity}</td>
                                    <td>{book.location}</td>
                                    <td className='actions-icons'>
                                        <FontAwesomeIcon
                                            icon={faEdit}
                                            className='edit-icon'
                                            onClick={() => handleEditBook(book.book_id)}
                                        />
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className='delete-icon'
                                            onClick={() => handleDeleteBook(book.book_id)}
                                        />
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
        </div>
    );
}

export default AdminBookManage;