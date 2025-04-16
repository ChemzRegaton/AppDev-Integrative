import { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './adminHome.css';
import Sidebar from './sideBar.jsx';
import femaleImage from '../assets/female.jpg';
import maleImage from '../assets/male.jpg';
import defaultBookCover from '../user/assets/Default_book_cover.webp'; // Import default book cover
import defaultProfileImage from '../assets/male.jpg'; // Import default profile image

function AdminHome() {
  const [error, setError] = useState('');
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalBorrowedBooks, setTotalBorrowedBooks] = useState(0);
  const navigate = useNavigate();
  const [borrowRequests, setBorrowRequests] = useState([]);
  const authToken = localStorage.getItem('authToken');

  const handleQuickBook = () => {
    navigate('/admin/bookManage');
  };

  const handleQuickReturn = () => {
    navigate('/admin/bookReturn');
  };

  const handleQuickRequest = () => {
    navigate('/admin/borrowBooks');
  };

  useEffect(() => {
    const fetchTotalBooks = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/library/books/');
        setTotalBooks(response.data.total_books);
      } catch (error) {
        console.error('Error fetching total books:', error);
        setError('Failed to fetch total books.');
      }
    };

    const fetchTotalBorrowedBooks = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/library/borrowing-records/', {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        setTotalBorrowedBooks(response.data.totalBorrowedRecords);
      } catch (error) {
        console.error('Error fetching total borrowed books:', error);
      }
    };

    const fetchBorrowRequests = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/library/admin/requests/pending/', {
          headers: {
            'Authorization': `Token ${authToken}`,
          },
        });
        setBorrowRequests(response.data);
      } catch (error) {
        console.error('Error fetching borrow requests:', error);
        setError('Failed to fetch borrow requests.');
      }
    };

    fetchTotalBooks();
    fetchTotalBorrowedBooks();
    fetchBorrowRequests();
  }, [authToken]);

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/library/requests/${requestId}/accept/`, // Same endpoint to update request status
        {},
        {
          headers: {
            'Authorization': `Token ${authToken}`,
          },
        }
      );
      console.log(`Request ${requestId} accepted successfully:`, response.data);

      // After successfully accepting the request, make a POST request to create a borrowing record
      const borrowResponse = await axios.post(
        `http://localhost:8000/api/library/books/${response.data.book_detail.book_id}/borrow/`, // Use the borrow book endpoint
        {},
        {
          headers: {
            'Authorization': `Token ${authToken}`,
          },
        }
      );
      console.log(`Borrowing record created:`, borrowResponse.data);
      // Optionally update your UI to reflect the book as borrowed
      setBorrowRequests(borrowRequests.filter(req => req.id !== requestId)); // Remove the accepted request from the list
      // Optionally update totalBorrowedBooks state if needed

    } catch (error) {
      console.error(`Error accepting request or creating borrow record:`, error);
      setError('Failed to accept request or create borrow record.');
      // Optionally handle different error scenarios (e.g., book unavailable)
    }
  };

  

  const BookCoverImage = ({ imageUrl }) => {
    const src = imageUrl ? `${window.location.origin}${imageUrl}` : defaultBookCover;
    return <img src={src} alt="Book Cover" style={{ width: '50px', height: '70px', objectFit: 'cover', marginRight: '10px' }} />;
  };

  const UserProfileImage = ({ gender }) => {
    const src = gender === 'female' ? femaleImage : gender === 'male' ? maleImage : defaultProfileImage;
    return <div
      className='userNotifyDetailsProfile'
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginRight: '10px',
      }}
    ></div>;
  };

  return (
    <div className='dashboard'>
      <Sidebar />
      <section className='dashReports'>
        <section className='bookStatus'>
          <p style={{ color: 'black', opacity: '50%', marginLeft: '40px' }}>Monthly Library Status</p>
          <section className='bookData'>
            <section className='books'>
              <p className='label'> Total Books</p>
              <p className='count' style={{ color: 'orange', fontSize: '14vh' }}>{totalBooks}</p>
            </section>
            <section className='books'>
              <p className='label'> Borrowed Books</p>
              <p className='count' style={{ color: 'red', fontSize: '14vh' }}>{totalBorrowedBooks}</p>
            </section>
            <section className='books'>
              <p className='label'> Returned Books</p>
              <p className='count' style={{ color: 'green', fontSize: '14vh' }}>53</p>
            </section>
          </section>
        </section>
        <section className='quickAction'>
          <button onClick={handleQuickBook}>Add New Book</button>
          <button onClick={handleQuickReturn}>Book Return</button>
          <button onClick={handleQuickRequest}>Borrow Request</button>
        </section>
        <section className='bookRequestNotify' >
          <p className='label' style={{ marginBottom: '20px' }}>Borrow Request</p>
          <section>
            
          </section>
          {borrowRequests.map(request => (
            <section key={request.id} className='userNotify' style={{ alignItems: 'center', maxWidth: '200vh'}}>
              <UserProfileImage gender={request.requester_profile && request.requester_profile.gender} />
              <section
                className='userNotifyDetails'
                style={{
                  width: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  textJustify: 'left',
                  marginLeft: '10px',
                }}
              >
                <p className='label'>{request.requester_profile ? request.requester_profile.fullname : 'N/A'}</p> {/* Changed here */}
                <p>{request.requester_profile ? `${request.requester_profile.role} - ${request.requester_profile.course || 'N/A'}` : 'N/A'}</p>
              </section>
            
              <section className='userNotifyDetails' style={{ width: 'auto', fontWeight: 'bold', marginLeft: '10px' }}>
                {request.book_detail && request.book_detail.title}
              </section>
              <section className='btn' style={{ marginLeft: 'auto', marginRight: '-30vh'}}>
                <button onClick={() => handleAcceptRequest(request.id)}>Accept</button>
              </section>
            </section>
          ))}
          {borrowRequests.length === 0 && <p>No new borrow requests.</p>}
        </section>        <section>
        </section>
      </section>
    </div>
  );
}

export default AdminHome;