// Message.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './message.css';

function Message({ onClose, onProfileUpdated, message }) { // Add onProfileUpdated prop
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserInfo, setCurrentUserInfo] = useState({
        userId: '',
        username: '',
        email: '',
    });
    const [userData, setUserData] = useState({
        fullname: '',
        role: 'Student', // Default value
        studentId: '',
        age: '',
        course: 'BSIT', // Default value
        address: '',
        contactNumber: '',
        birthdate: '',
    });

    useEffect(() => {
        fetchCurrentUserInfo();
    }, []);

    const fetchCurrentUserInfo = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('Authentication token not found.');
                return;
            }
            const response = await axios.get('https://appdev-integrative-28.onrender.com/api/auth/profile/', {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            const { id: userId, username, email } = response.data;
            setCurrentUserInfo({ userId, username, email });
        } catch (error) {
            console.error('Error fetching current user info:', error);
            setErrorMessage('Failed to fetch user information.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleUpdateProfile = async () => {
        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Get the authentication token from localStorage
            const token = localStorage.getItem('authToken');
            console.log("Retrieved token:", token);
            if (!token) {
                setErrorMessage('Authentication token not found. Please log in again.');
                return;
            }

            const profilePayload = {
                ...userData,
                userId: currentUserInfo.userId,
                username: currentUserInfo.username,
                email: currentUserInfo.email,
            };

            const response = await axios.put(
                'https://appdev-integrative-28.onrender.com/api/auth/profile/', // Your new API endpoint
                profilePayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`, // Include the token for authentication
                    },
                }
            );
            console.log('User profile updated successfully:', response.data);
            setSuccessMessage('Profile updated successfully!');
            console.log('Recorded data:', profilePayload); // Log the data being sent

            // Call the onProfileUpdated callback with the complete profile data
            if (onProfileUpdated) {
                onProfileUpdated(profilePayload); // Send the payload with userId, username, email
            }

            onClose(); // Close the panel after successful update
        } catch (error) {
            console.error('Error updating profile:', error.response ? error.response.data : error.message);
            setErrorMessage(error.response ? JSON.stringify(error.response.data) : 'Failed to update profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="MessageContainer"> {/* Keep the styling class if needed */}
            <h2 style={{ color: 'white' }}>{message}</h2>
            
                <button className='okay' onClick={onClose}>
                    Okay
                </button>
            
        </div>
    );
}

export default Message;