import { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './adminNotification.css';
import Sidebar from './sideBar.jsx';

function AdminNotification() {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');
    const [newMessagesCount, setNewMessagesCount] = useState(0);
    const authToken = localStorage.getItem('authToken');
    const pollingInterval = 5000; // Check for new messages every 5 seconds

    const fetchNewMessagesCount = async () => {
        try {
            const response = await axios.get('https://appdev-integrative-28.onrender.com/api/auth/admin/messages/unread/count/', { // New backend endpoint
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            });
            setNewMessagesCount(response.data.count);
        } catch (error) {
            console.error('Error fetching new messages count:', error);
            setError('Failed to check for new messages.');
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get('https://appdev-integrative-28.onrender.com/api/auth/admin/messages/', {
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to fetch messages.');
        }
    };

    useEffect(() => {
        fetchMessages(); // Initial load
        const intervalId = setInterval(fetchNewMessagesCount, pollingInterval); // Start polling

        return () => clearInterval(intervalId); // Clean up the interval on unmount
    }, []);

    useEffect(() => {
        if (newMessagesCount > 0) {
            // Display a notification (e.g., update a badge or show a message)
            console.log(`You have ${newMessagesCount} new unread messages!`);
            // You might also want to refetch the full message list here
            fetchMessages();
        }
    }, [newMessagesCount]);

    return (
        <div className='dashboard'>
            <Sidebar />
            <section className='received-messages-container'>
                <h1>Inbox </h1>
                {error && <p className='error'>{error}</p>}
                {/* Display the messages */}
                {messages.length > 0 ? (
                    <div className="message-list">
                        {messages.map((message) => (
                            <>
                                <div className="message-header" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'row'}}>
                                    <p><strong>Sender:</strong> {message.user.username}</p>
                                    <p style={{marginLeft: '10px'}}><strong>Sent At:</strong> {new Date(message.sent_at).toLocaleString()}</p>
                                </div>
                                <div key={message.id} className={`message-item ${message.is_read ? 'read' : 'unread'}`}>

                                    <div className="message-content">
                                        <p><strong>Subject:</strong> {message.subject}</p>
                                        <p style={{fontWeight: 'lighter'}}>{message.message}</p>
                                    </div>
                                </div>
                            </>
                        ))}
                    </div>
                ) : (
                    <p>No messages to display.</p>
                )}
            </section>
        </div>
    );
}

export default AdminNotification;
