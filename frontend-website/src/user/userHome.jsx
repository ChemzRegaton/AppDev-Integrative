// In UserHome.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './userHome.css';
import Sidebar from './sideBar.jsx';
import AddBookPanel from './components/additionalInfo.jsx';
import Message from './components/message.jsx'; // Import the Message component
import axios from 'axios';
import defaultBookCover from './assets/Default_book_cover.webp';

function UserHome() {
    const [role, setRole] = useState('');
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');
    const [isAddBookPanelVisible, setAddBookPanelVisible] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [errorProfile, setErrorProfile] = useState('');
    const [totalBooks, setTotalBooks] = useState(0);
    const [requestCount, setRequestCount] = useState(parseInt(localStorage.getItem('requestCount')) || 0);
    const [allBooks, setAllBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [messageText, setMessageText] = useState(''); // State to hold the message
    const [isMessageVisible, setIsMessageVisible] = useState(false);
    const [borrowedBooksCount, setBorrowedBooksCount] = useState(0);
    const [refreshUserHome, setRefreshUserHome] = useState(false);
    const isFirstLoad = useRef(true);
    const borrowedBooksCountRef = useRef(0);

    const fetchUserProfileAndBooks = useCallback(async () => {
        setLoadingProfile(true);
        setErrorProfile('');
        setLoading(true);
        setError('');
        try {
            const profileResponse = await axios.get('https://appdev-integrative-28.onrender.com/api/auth/profile/', {
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            });
            setUserProfile(profileResponse.data);
            const isInfoFilled = profileResponse.data.fullname && profileResponse.data.role && profileResponse.data.course && profileResponse.data.birthdate && profileResponse.data.address;
            setAddBookPanelVisible(!isInfoFilled);

            const booksResponse = await axios.get('https://appdev-integrative-28.onrender.com/api/library/books/', {
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            });
            setTotalBooks(booksResponse.data.total_books);
            setAllBooks(booksResponse.data.books);
            setFilteredBooks(booksResponse.data.books);

            // Fetch borrowed books count
            const borrowedBooksResponse = await axios.get('https://appdev-integrative-28.onrender.com/api/library/borrowing-records/', {
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            });
            const borrowedCount = borrowedBooksResponse.data.borrowingRecords.filter(record => !record.is_returned).length;
            setBorrowedBooksCount(borrowedCount);
            borrowedBooksCountRef.current = borrowedCount; // Initialize ref
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data.');
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
            if (!errorProfile) {
                setErrorProfile('Failed to fetch user profile.');
            }
        } finally {
            setLoadingProfile(false);
            setLoading(false);
        }
    }, [authToken, navigate, setBorrowedBooksCount, setAddBookPanelVisible, setError, setErrorProfile, setLoading, setLoadingProfile, setTotalBooks, setAllBooks, setFilteredBooks, setUserProfile]);

    useEffect(() => {
        console.log('useEffect triggered (fetchUserProfileAndBooks)');
        fetchUserProfileAndBooks();
        const storedRequestCount = parseInt(localStorage.getItem('requestCount')) || 0;
        console.log('useEffect - Stored requestCount from localStorage:', storedRequestCount);
        setRequestCount(storedRequestCount);
        console.log('useEffect - requestCount state set to:', requestCount);
    }, [fetchUserProfileAndBooks, refreshUserHome]);

    const handleCloseAddBookPanel = () => {
        setAddBookPanelVisible(false);
    };

    const handleCloseMessage = () => {
        setIsMessageVisible(false);
        setMessageText('');
    };

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const results = allBooks.filter(book =>
            book.title.toLowerCase().includes(term) ||
            book.author.toLowerCase().includes(term) ||
            book.category.toLowerCase().includes(term)
        );
        setFilteredBooks(results);
    };

    const BookCoverImage = ({ imageUrl, altText }) => {
        const src = imageUrl ? imageUrl.startsWith('http') || imageUrl.startsWith('data:image') ? imageUrl : `${window.location.origin}${imageUrl}` : defaultBookCover;
        return <img src={src} alt={altText} style={{ width: '100%', height: '40vh', objectFit: 'cover' }} />;
    };

    const resetRequestCount = () => {
        console.log('resetRequestCount called');
        localStorage.setItem('requestCount', '0');
        setRequestCount(0);
        setMessageText('Request count has been reset.');
        setIsMessageVisible(true);
        // Optionally trigger a re-fetch if needed for other UI updates
        setRefreshUserHome(prev => !prev);
    };

    const handleSendRequest = async (bookId, availableQuantity) => {
        console.log('handleSendRequest called');
        // Get the current request count from the state
        let currentRequestCount = requestCount;
        console.log('handleSendRequest - Current requestCount state:', currentRequestCount);
        //resetRequestCount(); // You can uncomment this line if you want to reset before each request

        if (borrowedBooksCount >= 3) {
            setMessageText(<span style={{ color: 'orange' }}>You can only borrow up to 3 books.</span>);
            setIsMessageVisible(true);
            return;
        }

        if (currentRequestCount >= 3) {
            setMessageText(<span style={{ color: 'orange' }}>You can only send up to 3 book requests.</span>);
            setIsMessageVisible(true);
            return;
        }

        if (availableQuantity <= 0) {
            setMessageText('This book is currently unavailable.');
            setIsMessageVisible(true);
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

            // Increment the state
            const newRequestCount = currentRequestCount + 1;
            setRequestCount(newRequestCount);
            console.log('handleSendRequest - New requestCount state:', newRequestCount);

            // Update localStorage to reflect the new count
            localStorage.setItem('requestCount', newRequestCount);
            console.log('handleSendRequest - localStorage requestCount updated to:', newRequestCount);

            setMessageText(`Your request for "${response.data.book_detail.title}" was sent.`);
            setIsMessageVisible(true);
        } catch (error) {
            console.error('handleSendRequest - Error sending borrow request:', error);
            setMessageText('Failed to send request.');
            setIsMessageVisible(true);
        }
    };

    const handleBookReturnedFromAdmin = () => {
        console.log('handleBookReturnedFromAdmin called');
        const storedRequestCount = parseInt(localStorage.getItem('requestCount')) || 0;
        console.log('handleBookReturnedFromAdmin - Stored requestCount from localStorage:', storedRequestCount);
        // Directly update the requestCount from localStorage and then trigger a re-fetch
        setRequestCount(storedRequestCount);
        console.log('handleBookReturnedFromAdmin - requestCount state set to:', storedRequestCount);
        setRefreshUserHome(prev => !prev);
    };

    useEffect(() => {
        const checkAndUpdateCounts = async () => {
            const storedRequestCount = parseInt(localStorage.getItem('requestCount')) || 0;
            if (storedRequestCount !== requestCount) {
                setRequestCount(storedRequestCount);
                console.log('UserHome: Request count updated from localStorage:', storedRequestCount);
            }

            // Re-fetch borrowed books count
            try {
                const borrowedBooksResponse = await axios.get('https://appdev-integrative-28.onrender.com/api/library/borrowing-records/', {
                    headers: {
                        'Authorization': `Token ${authToken}`,
                    },
                });
                const currentBorrowedCount = borrowedBooksResponse.data.borrowingRecords.filter(record => !record.is_returned).length;
                const previousBorrowedCount = borrowedBooksCountRef.current;

                if (previousBorrowedCount > currentBorrowedCount && storedRequestCount > 0) {
                    const newRequestCount = storedRequestCount - 1;
                    localStorage.setItem('requestCount', newRequestCount.toString());
                    setRequestCount(newRequestCount);
                    console.log('UserHome: Borrowed book returned, decreasing request count to:', newRequestCount);
                    setMessageText('A book has been returned. You can borrow now another.');
                    setIsMessageVisible(true);
                }
                borrowedBooksCountRef.current = currentBorrowedCount;

            } catch (error) {
                console.error('UserHome: Error fetching borrowed books count for update:', error);
            }
        };

        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        const intervalId = setInterval(checkAndUpdateCounts, 2000); // Check every 2 seconds

        return () => clearInterval(intervalId);
    }, [requestCount, authToken]);

    return (
        <div className='dashboard'>
            <Sidebar onResetRequestCount={resetRequestCount} /> {/* Pass the reset function to Sidebar */}
            {isAddBookPanelVisible && (
                <AddBookPanel onClose={handleCloseAddBookPanel} />
            )}
            {isMessageVisible && (
                <Message message={messageText} onClose={handleCloseMessage} />
            )}
            <section className='searchBooks' style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, padding: '10px 0', marginBottom: '10px' }}>
                <input
                    className='btn'
                    placeholder='Search Title, Author and Category'
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </section>

            <section className='card-container'>
                {filteredBooks.map(book => (
                    <section key={book.id} className='book-card'>
                        <div className='book-cover'>
                            <BookCoverImage imageUrl={book.cover_image} altText={book.title} />
                        </div>
                        <div className='book-details'>
                            <h3 className='book-title'>{book.title}</h3>
                            <p className='book-info'>Author: {book.author}</p>
                            <p className='book-info' style={{ color: 'orange' }}>Category: {book.category}</p>
                            <p className='book-info' style={{ color: 'lightgreen' }}>Available: {book.available_quantity}</p>
                        </div>
                        <button
                            className='book-request-button'
                            onClick={() => handleSendRequest(book.book_id, book.available_quantity)}
                            disabled={book.available_quantity <= 0}
                            style={{
                                opacity: book.available_quantity <= 0 ? 0.6 : 1,
                                cursor: book.available_quantity <= 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {book.available_quantity <= 0 ? 'Unavailable' : 'Send Request'}
                        </button>
                    </section>
                ))}
                {filteredBooks.length === 0 && searchTerm && <p>No books found matching your search.</p>}
            </section>
        </div>
    );
}

export default UserHome;