import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './adminUserProfiles.css'; // Make sure this CSS file exists
import Sidebar from './sideBar.jsx';

function AdminUserProfiles() { // Renamed function name
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsersWithBorrowCount();
    }, []);

    useEffect(() => {
        // Filter users whenever the searchTerm or users change
        const results = users.filter(user =>
            Object.values(user).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const fetchUsersWithBorrowCount = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Authentication token not found.');
                return;
            }
            const response = await axios.get('http://127.0.0.1:8000/api/auth/users/', { // New API endpoint
                headers: {
                    'Authorization': `Token ${localStorage.getItem('authToken')}`,
                },
            });
            setUsers(response.data);
            setTotalUsers(response.data.length);
        } catch (error) {
            console.error('Error fetching users with borrow count:', error);
            setError('Failed to fetch users.');
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Placeholder for actions (you might want to add edit/delete functionality later)
    const handleEditUser = (userId) => {
        console.log(`Edit user with ID: ${userId}`);
        // Implement navigation to edit page if needed
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm(`Are you sure you want to message user with ID: ${username}?`)) {
        }
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
                {!error && (filteredUsers.length > 0 || users.length === 0) && (
                    <table>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Fullname</th>
                                <th>Role</th>
                                <th>Student ID</th>
                                <th>Age</th>
                                <th>Course</th>
                                <th>Birthdate</th>
                                <th>Address</th>
                                <th>Contact No.</th>
                                <th>Borrowed</th> 
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id || user.username}> 
                                    <td>{user.id || 'N/A'}</td> 
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.fullname || 'N/A'}</td>
                                    <td>{user.role || 'N/A'}</td>
                                    <td>{user.studentId || 'N/A'}</td>
                                    <td>{user.age || 'N/A'}</td>
                                    <td>{user.course || 'N/A'}</td>
                                    <td>{user.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'N/A'}</td>
                                    <td>{user.address || 'N/A'}</td>
                                    <td>{user.contactNumber || 'N/A'}</td>
                                    <td>{user.borrowed_count || 0}</td> 
                                    <td>
                                        <button className='delete-btn' onClick={() => handleDeleteUser(user.id || user.username)}>Message</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!error && users.length > 0 && filteredUsers.length === 0 && (
                    <p>No users found matching your search criteria.</p>
                )}
                {!error && users.length === 0 && (
                    <p>No users found.</p>
                )}
            </section>
        </div>
    );
}

export default AdminUserProfiles;