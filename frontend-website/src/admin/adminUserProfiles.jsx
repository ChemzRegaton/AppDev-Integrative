import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './adminUserProfiles.css'; // Make sure this CSS file exists
import Sidebar from './sideBar.jsx';
import Message from './components/message.jsx'; // Import the Message component
import UserDetailsModal from './components/UserDetailsModal'; // Import the UserDetailsModal component
import { FaBell } from 'react-icons/fa'; // Import the bell icon from react-icons

function AdminUserProfiles() {
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const navigate = useNavigate();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [detailedUser, setDetailedUser] = useState(null);
    const [generalMessage, setGeneralMessage] = useState('');
    const [isGeneralMessageVisible, setIsGeneralMessageVisible] = useState(false);
    const [preventRowClick, setPreventRowClick] = useState(false);

    useEffect(() => {
        fetchUsersWithBorrowCount();
    }, []);

    useEffect(() => {
        const results = users.filter(user =>
            Object.values(user).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setFilteredUsers(results);

        if (selectedUserId) {
            setDetailedUser(results.find(user => user.id === selectedUserId) || users.find(user => user.id === selectedUserId) || null);
        } else {
            setDetailedUser(null);
        }
    }, [searchTerm, users, selectedUserId]);

    const fetchUsersWithBorrowCount = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Authentication token not found.');
                return;
            }
            const response = await axios.get('https://appdev-integrative-28.onrender.com/api/auth/users/', {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('authToken')}`,
                },
            });
            setUsers(response.data);
            setTotalUsers(response.data.length);
        } catch (error) {
            console.error('Error fetching users with borrow count:', error);
            setError('Failed to fetch users.');
            setGeneralMessage('Failed to fetch users.');
            setIsGeneralMessageVisible(true);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setSelectedUserId(null);
        setDetailedUser(null);
    };

    const handleSendMessageClick = (userId, event) => {
        event.stopPropagation(); // Prevent row click when clicking "Remind"
        setSelectedUserId(userId);
        sendReturnReminder(userId);
    };

    const sendReturnReminder = async (userId) => {
        if (!userId) return;
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Authentication token not found.');
            setGeneralMessage('Authentication required.');
            setIsGeneralMessageVisible(true);
            return;
        }

        try {
            const response = await axios.post(
                `https://appdev-integrative-28.onrender.com/api/library/notifications/send-return/${userId}/`,
                {},
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                }
            );
            console.log('Return reminder sent:', response.data);
            setGeneralMessage(response.data.message);
            setIsGeneralMessageVisible(true);
            setSelectedUserId(null);
        } catch (error) {
            console.error('Error sending return reminder:', error);
            setGeneralMessage('Failed to send return reminder.');
            setIsGeneralMessageVisible(true);
        }
    };

    const handleCloseGeneralMessage = () => {
        setIsGeneralMessageVisible(false);
        setGeneralMessage('');
    };

    const handleRowClick = (userId, event) => {
        if (preventRowClick) return; // Prevent row click if needed
        setSelectedUserId(userId);
    };

    return (
        <div className='dashboard'>
            <Sidebar />
            <div className='Filter'>
                <input
                    className='searchBox'
                    placeholder='Search User'
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <section className='totalUsers'>
                    <p className='label' style={{ alignSelf: 'flex-start' }}>Total Users</p>
                    <p className='label' style={{ alignSelf: 'flex-start', fontSize: '80px', marginTop: '-20px' }}>{totalUsers}</p>
                </section>
            </div>
            <section className='usersTable'>
                {error && <p className='error'>{error}</p>}
                {!error && (filteredUsers.length > 0 || users.length === 0) && !detailedUser && (
                    <div className='table-container'> {/* Added a container for scrolling */}
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Fullname</th>
                                    <th>Role</th>
                                    <th>Stud ID</th>
                                    <th>Course</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id || user.username} onClick={(e) => handleRowClick(user.id, e)}>
                                        <td>{user.id || 'N/A'}</td>
                                        <td>{user.username}</td>
                                        <td>{user.fullname || 'N/A'}</td>
                                        <td>{user.role || 'N/A'}</td>
                                        <td>{user.studentId || 'N/A'}</td>
                                        <td>{user.course || 'N/A'}</td>
                                        <td>
                                            <button className='remind-btn' onClick={(e) => handleSendMessageClick(user.id || user.username, e)}>
                                                <FaBell className='remind-icon' /> Remind
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {detailedUser && (
                    <UserDetailsModal user={detailedUser} onClose={() => setDetailedUser(null)} />
                )}

                {!error && users.length > 0 && filteredUsers.length === 0 && !detailedUser && (
                    <p>No users found matching your search criteria.</p>
                )}
                {!error && users.length === 0 && !detailedUser && (
                    <p>No users found.</p>
                )}
            </section>

            {isGeneralMessageVisible && (
                <Message message={generalMessage} onClose={handleCloseGeneralMessage} />
            )}
        </div>
    );
}

export default AdminUserProfiles;