import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './userHome.css';
import Sidebar from './sideBar.jsx';
import AddBookPanel from './components/additionalInfo.jsx';
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
  const [allBooks, setAllBooks] = useState([]); // Store all fetched books
  const [filteredBooks, setFilteredBooks] = useState([]); // Store filtered books
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUserProfileAndBooks = async () => {
      setLoadingProfile(true);
      setErrorProfile('');
      setLoading(true);
      setError('');
      try {
        const profileResponse = await axios.get('http://localhost:8000/api/auth/profile/', {
          headers: {
            'Authorization': `Token ${authToken}`,
          },
        });
        setUserProfile(profileResponse.data);
        const isInfoFilled = profileResponse.data.fullname && profileResponse.data.role && profileResponse.data.course && profileResponse.data.birthdate && profileResponse.data.address;
        setAddBookPanelVisible(!isInfoFilled);

        const booksResponse = await axios.get('http://localhost:8000/api/library/books/', {
          headers: {
            'Authorization': `Token ${authToken}`,
          },
        });
        setTotalBooks(booksResponse.data.total_books);
        setAllBooks(booksResponse.data.books);
        setFilteredBooks(booksResponse.data.books); // Initially show all books
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
    };

    if (authToken) {
      fetchUserProfileAndBooks();
    } else {
      navigate('/login');
    }
  }, [authToken, navigate]);

  const handleCloseAddBookPanel = () => {
    setAddBookPanelVisible(false);
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

  if (loadingProfile || loading) {
    return <div>Loading data...</div>;
  }

  if (errorProfile || error) {
    return <div>Error: {errorProfile || error}</div>;
  }

  const BookCoverImage = ({ imageUrl, altText }) => {
    const src = imageUrl ? imageUrl.startsWith('http') || imageUrl.startsWith('data:image') ? imageUrl : `${window.location.origin}${imageUrl}` : defaultBookCover;
    return <img src={src} alt={altText} style={{ width: '100%', height: '40vh', objectFit: 'cover' }} />;
  };

  const handleSendRequest = async (bookId) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/library/requests/',
        { book: bookId },
        {
          headers: {
            'Authorization': `Token ${authToken}`,
          },
        }
      );
      console.log('Borrow request sent successfully:', response.data);
      // Optionally provide feedback to the user
    } catch (error) {
      console.error('Error sending borrow request:', error);
      // Optionally provide feedback to the user
    }
  };

  return (
    <div className='dashboard'>
      <Sidebar />
      <section className='searchBooks'>
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
              <p className='book-info'>Category: {book.category}</p>
            </div>
            <button className='book-request-button' onClick={() => handleSendRequest(book.id)}>
              Send Request
            </button>
          </section>
        ))}
        {filteredBooks.length === 0 && searchTerm && <p>No books found matching your search.</p>}
      </section>

      {isAddBookPanelVisible && (
        <AddBookPanel onClose={handleCloseAddBookPanel} />
      )}
    </div>
  );
}

export default UserHome;