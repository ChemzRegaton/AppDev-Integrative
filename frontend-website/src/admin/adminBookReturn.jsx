import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './adminBookReturn.css'; // You might need a specific CSS for this page
import Sidebar from './sideBar.jsx';
import defaultProfileImage from '../assets/male.jpg'; // Import default profile image

function AdminBorrowRequest() {
    const [error, setError] = useState('');
    const [borrowRequests, setBorrowRequests] = useState([]);
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');
    const [requestCount, setRequestCount] = useState(localStorage.getItem('requestCount') || 0);

    useEffect(() => {
        fetchPendingBorrowRequests();
    }, []);

    const fetchPendingBorrowRequests = async () => {
        try {
            const response = await axios.get('https://appdev-integrative-28.onrender.com/api/library/admin/requests/pending/', {
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            });
            setBorrowRequests(response.data);
        } catch (error) {
            console.error('Error fetching pending borrow requests:', error);
            setError('Failed to fetch pending borrow requests.');
        }
    };

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

            // Decrease the request count in localStorage after accepting the request
            let currentCount = parseInt(localStorage.getItem('requestCount')) || 0;
            if (currentCount > 0) {
                const newCount = currentCount - 1;
                localStorage.setItem('requestCount', newCount); // Update localStorage with new count
                setRequestCount(newCount); // Update the state for UI update
            }

            // Filter out the accepted request from the list
            setBorrowRequests(borrowRequests.filter(req => req.id !== requestId));
        } catch (error) {
            console.error(`Error accepting request:`, error);
            setError('Failed to accept request.');
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const response = await axios.patch(
                `https://appdev-integrative-28.onrender.com/api/library/borrow_requests/${requestId}/reject/`, // Verify your reject endpoint
                {},
                {
                    headers: {
                        'Authorization': `Token ${authToken}`,
                    },
                }
            );
            console.log(`Request ${requestId} rejected successfully:`, response.data);
            fetchPendingBorrowRequests(); // Refresh the list
        } catch (error) {
            console.error(`Error rejecting request ${requestId}:`, error);
            setError('Failed to reject request.');
        }
    };

    const UserProfileImage = ({ profilePicture }) => {
        const getValidImageSource = () => {
            if (profilePicture) {
                return profilePicture.startsWith('http') || profilePicture.startsWith('data:image') ? profilePicture : `${window.location.origin}${profilePicture}`;
            }
            return defaultProfileImage;
        };

        const src = getValidImageSource();

        return (
            <div
                style={{
                    width: '30px', // Smaller image
                    height: '30px', // Smaller image
                    borderRadius: '15%',
                    marginRight: '5px', // Smaller margin
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
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
            <h1 style={{ alignSelf: 'left' }}>Pending Requests</h1>
            <section className='borrowRequestsTable'>

                {error && <p className='error'>{error}</p>}
                {borrowRequests.length === 0 ? (
                    <p style={{color: 'white'}}>No pending borrow requests.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Req. ID</th>
                                <th>Requester</th>
                                <th>Book</th>
                                <th>Author</th>
                                <th>Req. Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {borrowRequests.map(request => (
                                <tr key={request.id}>
                                    <td>{request.id}</td>
                                    <td>
                                        <section style={{ display: 'flex', alignItems: 'center', height: '4vh' }}>
                                            <UserProfileImage profilePicture={request.requester_profile?.profile_picture} />
                                            {request.requester_profile?.fullname || 'N/A'}
                                        </section>
                                    </td>
                                    <td>{request.book_detail?.title || 'N/A'}</td>
                                    <td>{request.book_detail?.author || 'N/A'}</td>
                                    <td>
                                        {new Date(request.request_date).toLocaleDateString('en-US', {
                                            month: 'numeric',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td>
                                        <button
                                            className='accept-btn'
                                            onClick={() => handleAcceptRequest(request.id)}
                                        >
                                            Accept
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default AdminBorrowRequest;