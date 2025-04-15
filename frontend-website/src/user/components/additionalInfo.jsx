// AdditionalInfo.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './additionalInfo.css';

function AdditionalInfo({ onClose, onProfileUpdated }) { // Add onProfileUpdated prop
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
            const response = await axios.get('http://127.0.0.1:8000/api/auth/profile/', {
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
                'http://127.0.0.1:8000/api/auth/profile/', // Your new API endpoint
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
        <div className="addBookPanelContainer"> {/* Keep the styling class if needed */}
            <h2 style={{ color: 'white' }}>Additional Information:</h2>
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            {successMessage && <p className="successMessage">{successMessage}</p>}
            <form className="bookInput" onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }}>
                <section className="addInputs">
                    <p style={{color: 'white', margin: '-4px'}}>Fullname:</p>
                    <input
                        className="input"
                        placeholder="Fullname"
                        name="fullname"
                        value={userData.fullname}
                        onChange={handleChange}
                    />
                    <p style={{color: 'white', margin: '-4px'}}>Role:</p>
                    <select id="role" name="role" value={userData.role} onChange={handleChange}>
                        <option value="Student">Student</option>
                        <option value="Faculty/Staff">Faculty/Staff</option>
                        <option value="Guest">Guest</option>
                    </select>

                    <p style={{color: 'white', margin: '1px'}}>ID Number: (If Student or Faculty/Staff)</p>
                    <input
                        className="input"
                        placeholder="Student ID/Organization ID Number"
                        name="studentId"
                        value={userData.studentId}
                        onChange={handleChange}
                    />
                    <p style={{color: 'white', margin: '-4px'}}>Age:</p>
                    <input type="number" id="age" name="age" min="5" max="500" placeholder='Age' value={userData.age} onChange={handleChange}></input>
                    <p style={{color: 'white', margin: '-4px'}}>College:</p>
                    <select id="course" name="course" value={userData.course} onChange={handleChange}>
                        <option value="N/A">N/A</option>
                        <option value="BSIT">CITC</option>
                        <option value="BSCPE">CSM</option>
                        <option value="BSArch">CEA</option>
                        <option value="BSMT">COT</option>
                        <option value="BSDS">CAS</option>
                    </select>

                    <p style={{color: 'white', margin: '-4px'}}>Address:</p>
                    <input
                        className="input"
                        type='address'
                        placeholder="Address"
                        name="address"
                        value={userData.address}
                        onChange={handleChange}
                    />
                    <p style={{color: 'white', margin: '-4px'}}>Contact Number:</p>
                    <input
                        className="input"
                        type='tel'
                        placeholder="Contact Number"
                        name="contactNumber"
                        value={userData.contactNumber}
                        onChange={handleChange}
                    />
                    <p style={{color: 'white', margin: '-4px'}}>Birthdate:</p>
                    <input
                        className="input"
                        type='date'
                        placeholder="Birthdate"
                        name="birthdate"
                        value={userData.birthdate}
                        onChange={handleChange}
                    />
                </section>
                <button className='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
}

export default AdditionalInfo;