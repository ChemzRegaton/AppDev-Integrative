import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './userNotification.css';
import Sidebar from './sideBar.jsx';

function UserNotification() {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');

    const fetchNotifications = async () => {
        if (!authToken) {
            console.error('Authentication token not found.');
            setError('You must be logged in to view notifications.');
            return;
        }
        try {
            const response = await axios.get('https://appdev-integrative-28.onrender.com/api/library/notifications/', {
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            });
            setNotifications(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError('Failed to fetch notifications.');
            if (error.response && error.response.status === 401) {
                setError('You are not authorized to view notifications.');
            }
        }
    };

    const deleteNotification = async (notificationId) => {
        if (!authToken) {
            console.error('Authentication token not found.');
            setError('You must be logged in to delete notifications.');
            return;
        }
        try {
            await axios.delete(`https://appdev-integrative-28.onrender.com/api/library/notifications/${notificationId}/`, {
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            });
            fetchNotifications();
        } catch (error) {
            console.error(`Error deleting notification ${notificationId}:`, error);
            setError(`Failed to delete notification.`);
            if (error.response && error.response.status === 401) {
                setError('You are not authorized to delete notifications.');
            } else if (error.response && error.response.status === 404) {
                setError('Notification not found.');
            }
        }
    };

    useEffect(() => {
        fetchNotifications();

        const intervalId = setInterval(fetchNotifications, 5000);

        return () => clearInterval(intervalId);
    }, [authToken]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' };
        return date.toLocaleDateString(undefined, options);
    };

    return (
        <div className='dashboard'>
            <Sidebar />
            <h1>Notifications</h1>
            <div className='notification-container'>
                {error && <p className='error'>{error}</p>}
                {notifications.length === 0 && !error && <p>No new notifications.</p>}
                {notifications.map(notification => (
                    <div key={notification.id} className='notification-item'>
                        {notification.created_at && <p className='date-received' style={{color: 'red', marginRight: '10px', fontWeight: 'bold'}}> ({formatDate(notification.created_at)})</p>}
                        {notification.message}
                        {notification.book_title && <p>Book: {notification.book_title}</p>}
                        {notification.status === 'accepted' && <p className='success'>Accepted</p>}
                        {notification.status === 'rejected' && <p className='error'>Rejected</p>}
                        {notification.status === 'returned' && <p className='success'>Returned</p>}
                        <button className='delete-button' onClick={() => deleteNotification(notification.id)}>
                            Delete
                        </button>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserNotification;