import { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './adminHome.css'
import Sidebar from './sideBar.jsx';
import femaleImage from '../assets/female.jpg';
import maleImage from '../assets/male.jpg';

function AdminHome() {
  const [error, setError] = useState('');
  const [totalBooks, setTotalBooks] = useState(0); // State to hold the total number of books
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
    // Function to fetch the total number of books from your API
    const fetchTotalBooks = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/library/books/'); // Assuming this endpoint returns the total in response.data.total_books
            setTotalBooks(response.data.total_books);
        } catch (error) {
            console.error('Error fetching total books:', error);
            setError('Failed to fetch total books.');
        }
    };

    const fetchTotalBorrowedBooks = async () => {
        const token = localStorage.getItem('authToken'); // Get your auth token
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/library/borrowing-records/', {
                headers: {
                    'Authorization': `Token ${token}`, // Include your auth token
                },
            });
            setTotalBorrowedBooks(response.data.totalBorrowedRecords);
        } catch (error) {
            console.error('Error fetching total borrowed books:', error);
            // Optionally set an error message for this specific fetch
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
    fetchBorrowRequests(); // Call this function on component mount
}, []);


const handleAcceptRequest = async (requestId) => {
    try {
      const response = await axios.patch( // Or put, depending on your backend preference
        `http://localhost:8000/api/library/requests/${requestId}/accept/`,
        {}, // You might send an empty body or data if needed
        {
          headers: {
            'Authorization': `Token ${authToken}`,
          },
        }
      );
      console.log(`Request ${requestId} accepted successfully:`, response.data);
      // Optionally update the UI (e.g., remove the accepted request from the list)
      setBorrowRequests(borrowRequests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error(`Error accepting request ${requestId}:`, error);
      // Optionally display an error message
    }
  };
  return (
    <div className='dashboard'>
      <Sidebar />
      <section className='dashReports'>

        <section className='bookStatus'>
          <p style={{color:  'black', opacity: '50%', marginLeft: '40px',}}>Monthly Library Status</p>
          <section className='bookData'>

            <section className='books'>
              <p className='label'> Total Books</p>
              <p className='count'style={{color: 'orange', fontSize: '14vh'}}>{totalBooks}</p>
            </section>

            <section className='books'>
            <p className='label'> Borrowed Books</p>
            <p className='count'style={{color: 'red', fontSize: '14vh'}}>{totalBorrowedBooks}</p>
            </section>

            <section className='books'>
            <p className='label'> Returned Books</p>
            <p className='count'style={{color: 'green', fontSize: '14vh'}}>53</p>
            </section>

          </section>

        </section>
        <section className='quickAction'>
        <button onClick={handleQuickBook}>Add New Book</button>
        <button onClick={handleQuickReturn}>Book Return</button>
        <button onClick={handleQuickRequest}>Borrow Request</button>
        </section>
        <section className='bookRequestNotify'>
          <p className='label' style={{ marginBottom: '20px' }}>Borrow Request</p>
          {borrowRequests.map(request => (
            <section key={request.id} className='userNotify'>
              <section
                className='userNotifyDetailsProfile'
                style={{
                  backgroundImage: `url(${request.requester_profile && request.requester_profile.gender === 'female' ? femaleImage : maleImage})`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              ></section>
              <section
                className='userNotifyDetails'
                style={{
                  width: '50vh',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  textJustify: 'left',
                  marginLeft: '30px',
                }}
              >
                <p className='label'>{request.requester_profile.first_name} {request.requester_profile.last_name}</p>
                <p>{request.requester_profile.role} - {request.requester_profile.course || 'N/A'}</p>
              </section>
              <section className='userNotifyDetails' style={{ width: '80vh', fontWeight: 'bold' }}>
                {request.book_detail.title}
              </section>
              <section className='userNotifyDetails' style={{ width: '23vh' }}>
                <button onClick={() => handleAcceptRequest(request.id)}>Accept</button>
              </section>
            </section>
          
          ))}
          {borrowRequests.length === 0 && <p>No new borrow requests.</p>}
        </section>
        <section>

        </section>
        </section>

      
    </div>
  );
}

export default AdminHome;