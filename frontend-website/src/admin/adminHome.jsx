import { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './adminHome.css';
import Sidebar from './sideBar.jsx';
import defaultBookCover from '../user/assets/Default_book_cover.webp';
import defaultProfileImage from '../assets/male.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faArrowRightArrowLeft, faBookOpen, faPlus, faUser } from '@fortawesome/free-solid-svg-icons'; // Import more icons

function AdminHome() {
    const [error, setError] = useState('');
    const [totalBooks, setTotalBooks] = useState(0);
    const [totalBorrowedBooks, setTotalBorrowedBooks] = useState(0);
    const [returnedBooksCount, setReturnedBooksCount] = useState(0);
    const navigate = useNavigate();
    const [borrowRequests, setBorrowRequests] = useState([]);
    const [allBorrowingRecords, setAllBorrowingRecords] = useState([]);
    const authToken = localStorage.getItem('authToken');

    const handleQuickBook = () => {
        navigate('/admin/bookManage');
    };

    const handleQuickReturn = () => {
        navigate('/admin/userProfiles');
    };

    const handleQuickRequest = () => {
        navigate('/admin/bookReturn');
    };

    const fetchTotalBooks = async () => {
        try {
            const response = await axios.get('https://appdev-integrative-28.onrender.com/api/library/books/');
            setTotalBooks(response.data.total_books);
            console.log("Books Response:", response.data);


        } catch (error) {
            console.error('Error fetching total books:', error);
            setError('Failed to fetch total books.');
        }
    };

    const fetchTotalBorrowedBooks = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get('https://appdev-integrative-28.onrender.com/api/library/borrowing-records/', {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            setTotalBorrowedBooks(response.data.totalBorrowedRecords);
            setAllBorrowingRecords(response.data.borrowingRecords);
            console.log("Borrow Records Response:", response.data);
        } catch (error) {
            console.error('Error fetching borrowing records:', error);
        }
    };

    const fetchBorrowRequests = async () => {
        try {
            const response = await axios.get('https://appdev-integrative-28.onrender.com/api/library/admin/requests/pending/', {
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

    useEffect(() => {
        fetchTotalBooks();
        fetchTotalBorrowedBooks();
        fetchBorrowRequests();

        const intervalId = setInterval(() => {
            fetchBorrowRequests();
        }, 3000);

        return () => clearInterval(intervalId);
    }, [authToken]);

    useEffect(() => {
        const returnedCount = allBorrowingRecords.filter(record => record.is_returned).length;
        setReturnedBooksCount(returnedCount);
    }, [allBorrowingRecords]);

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await axios.patch(
                `https://appdev-integrative-28.onrender.com/api/library/requests/${requestId}/accept/`,
                {},
                {
                    headers: {
                        'Authorization': `Token ${authToken}`,
                    },
                }
            );
            console.log(`Request ${requestId} accepted successfully:`, response.data);

            // No longer removing the request from local state here
        } catch (error) {
            console.error(`Error accepting request:`, error);
            setError('Failed to accept request.');
        }
    };

    const refreshReturnedBooksCount = () => {
        fetchTotalBorrowedBooks();
    };

    const BookCoverImage = ({ imageUrl }) => {
        const src = imageUrl ? `${window.location.origin}${imageUrl}` : defaultBookCover;
        return <img src={src} alt="Book Cover" style={{ width: '50px', height: '70px', objectFit: 'cover', marginRight: '10px' }} />;
    };

    const UserProfileImage = ({ profilePicture }) => {
        const getValidImageSource = () => {
            if (profilePicture) {
                return  profilePicture.startsWith('http') ||  profilePicture.startsWith('data:image') ? profilePicture : `${window.location.origin}${profilePicture}`;
            }
            return defaultProfileImage;

        };

        const src = getValidImageSource();

        return (
            <div
                className='userNotifyDetailsProfile'
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    marginRight: '10px',
                    overflow: 'hidden',
                }}
            >
                <img
                    src={src}
                    alt="Profile"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />

            </div>
        );
    };

    return (
        <div className='dashboard'>
            <Sidebar />
            <section className='dashReports'>
                <section className='bookStatus'>
                    <p style={{ color: 'white', marginLeft: '40px'}}>Monthly Library Status</p>
                    <section className='bookData'>
                        <section className='books'>
                            <FontAwesomeIcon icon={faBook} className='report-icon' />
                            <p className='label'> Total Books</p>
                            <p className='count' style={{ color: 'orange', fontSize: '8vh' }}>{totalBooks}</p>
                        </section>
                        <section className='books'>
                            <FontAwesomeIcon icon={faArrowRightArrowLeft} className='report-icon' />
                            <p className='label'> Borrowed Books</p>
                            <p className='count' style={{ color: 'orange', fontSize: '8vh' }}>{totalBorrowedBooks}</p>
                        </section>
                        <section className='books'>
                            <FontAwesomeIcon icon={faBookOpen} className='report-icon' />
                            <p className='label'> Returned Books</p>
                            <p className='count' style={{ color: 'orange', fontSize: '8vh' }}>{returnedBooksCount}</p>
                        </section>
                    </section>
                </section>
                <section className='quickAction'>
                    <button onClick={handleQuickBook} className='quick-action-button'>
                        <FontAwesomeIcon icon={faPlus} className='quick-action-icon' /> Add New Book
                    </button>
                    <button onClick={handleQuickReturn} className='quick-action-button'>
                        <FontAwesomeIcon icon={faUser} className='quick-action-icon' /> Users List
                    </button>
                    <button onClick={handleQuickRequest} className='quick-action-button'>
                        <FontAwesomeIcon icon={faBookOpen} className='quick-action-icon' /> Borrow Request List
                    </button>
                </section>
                <section className='bookRequestNotify' >
                    <p className='label' style={{ marginBottom: '20px' }}>Borrow Request</p>
                    <section>

                    </section>
                    {borrowRequests.map(request => (
                        <section key={request.id} className='userNotify' style={{ alignItems: 'center', maxWidth: '200vh' }}>
                            <UserProfileImage
                                profilePicture={request.requester_profile?.profile_picture}

                            />
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
                                <p className='label'>{request.requester_profile ? request.requester_profile.fullname : 'N/A'}</p>
                                <p>{request.requester_profile ? `${request.requester_profile.role} - ${request.requester_profile.course || 'N/A'}` : 'N/A'}</p>
                            </section>

                            <section className='userNotifyDetails' style={{ width: 'auto', fontWeight: 'bold', marginLeft: '10px' }}>
                                {request.book_detail && request.book_detail.title}
                            </section>
                            <section className='btn' style={{ marginLeft: 'auto', marginRight: '-30vh' }}>
                                <button onClick={() => handleAcceptRequest(request.id)}>Accept</button>
                            </section>
                        </section>
                    ))}
                    {borrowRequests.length === 0 && <p>No new borrow requests.</p>}
                </section>

            </section>
        </div>
    );
}

export default AdminHome;