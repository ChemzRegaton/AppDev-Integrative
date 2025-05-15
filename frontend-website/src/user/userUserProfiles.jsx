import { useState, useEffect, useRef } from 'react'; // Import useRef
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './userUserProfiles.css';
import Sidebar from './sideBar.jsx';
import defaultProfileImage from '../assets/male.jpg'; // Import a default image
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faVenusMars, faBook, faCalendarAlt, faPencilAlt, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons'; // Import missing icons
import AdditionalInfo from './components/additionalInfo.jsx'; // Import the AdditionalInfo component

function UserUserProfiles() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');
    const API_BASE_URL = 'https://appdev-integrative-28.onrender.com'; // Define your API base URL
    const fileInputRef = useRef(null); // Create a ref for the file input
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingProfileData, setEditingProfileData] = useState(null);


    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`${API_BASE_URL}/api/auth/profile/`, {
                    headers: {
                        'Authorization': `Token ${authToken}`,
                    },
                });
                setProfile(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError('Failed to fetch user profile.');
                if (error.response && error.response.status === 401) {
                    navigate('/login'); // Redirect to login if unauthorized
                }
            } finally {
                setLoading(false);
            }
        };

        if (authToken) {
            fetchUserProfile();
        } else {
            navigate('/login'); // Redirect to login if no token
        }
    }, [authToken, navigate, API_BASE_URL]);

    const handleProfileUpdated = (updatedProfile) => {
        setProfile(updatedProfile);
        setIsEditing(false); // Close the edit panel
        setEditingProfileData(null); // Clear editing data
    };

    const handleEditClick = () => {
        setIsEditing(true);
        // Populate editingProfileData with the current profile info for the editable fields
        setEditingProfileData({
            age: profile?.age || '',
            course: profile?.course || '',
            address: profile?.address || '',
            contactNumber: profile?.contactNumber || '',
            birthdate: profile?.birthdate || '',
            gender: profile?.gender || '',
            section: profile?.section || '',
            school_year: profile?.school_year || '',
        });
    };

    const handleCloseEdit = () => {
        setIsEditing(false);
        setEditingProfileData(null);
    };

    const handleOpenFileExplorer = () => {
        fileInputRef.current.click(); // Trigger the hidden file input
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleUploadProfilePicture = async () => {
        if (!selectedFile) {
            setUploadMessage('Please select a profile picture.');
            return;
        }

        setUploading(true);
        setUploadMessage('Uploading...');
        setError('');

        const formData = new FormData();
        formData.append('profile_picture', selectedFile); // 'profile_picture' should match your backend field name

        try {
            const response = await axios.patch( // Or PUT, depending on your backend API
                `${API_BASE_URL}/api/auth/profile/upload_picture/`, // Your backend upload endpoint
                formData,
                {
                    headers: {
                        'Authorization': `Token ${authToken}`,
                        'Content-Type': 'multipart/form-data', // Important for file uploads
                    },
                }
            );
            console.log('Profile picture uploaded successfully:', response.data);
            setUploadMessage('Profile picture updated successfully!');
            setSelectedFile(null); // Clear selected file
            // Refresh the profile data to show the new picture
            fetchUserProfile();
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        } finally {
            setUploading(false);
            setTimeout(() => setUploadMessage(''), 3000); // Clear message after 3 seconds
        }
    };

    const profilePictureUrl = profile?.profile_picture
        ? `${API_BASE_URL}${profile.profile_picture}`
        : defaultProfileImage;

    return (
        <section className='dashboard'>
            <Sidebar />
            <section className='profile-picture-container'>
                <img
                    src={profilePictureUrl}
                    alt="Profile Picture"
                    className='profile-picture'
                />
                <section className='details' >
                    <section className='name'>
                        {profile?.fullname && <strong style={{ color: 'black'}}>{profile.fullname}</strong>}
                    </section >
                    {profile?.studentId && <p style={{ fontStyle: 'italic', opacity: '50%', marginLeft: '20px', color: 'black' }}><strong style={{ color: 'black'}}>ID Number:</strong> {profile.studentId}</p>}
                    <button onClick={handleOpenFileExplorer} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Change Profile Picture'}
                    </button>
                    {uploadMessage && <p className={error ? 'error-message' : 'upload-message'}>{uploadMessage}</p>}
                    {selectedFile && (
                        <button onClick={handleUploadProfilePicture} disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Save New Picture'}
                        </button>
                    )}
                    <input
                        type="file"
                        accept="image/*" // Only allow image files
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </section>
            </section>
            <section className='role'>
                {profile?.role && <p>{profile.role}</p>}
            </section>
            <section className='others'>
                <section className='info'>
                    <h2>Additional Information</h2>
                    <button onClick={handleEditClick} className="edit-button">
                        <FontAwesomeIcon icon={faPencilAlt} /> Edit
                    </button>

                    {isEditing && editingProfileData && (
                        <AdditionalInfo
                            onClose={handleCloseEdit}
                            onProfileUpdated={handleProfileUpdated}
                            initialProfileData={editingProfileData}
                        />
                    )}
                    {profile?.username && <p><FontAwesomeIcon icon={faUser} /> <strong>Username:</strong> {profile.username}</p>}
                    {profile?.email && <p><FontAwesomeIcon icon={faUser} /> <strong>Email:</strong> {profile.email}</p>}
                    {profile?.age && <p><FontAwesomeIcon icon={faCalendarAlt} /> <strong>Age:</strong> {profile.age}</p>}
                    {profile?.course && <p><FontAwesomeIcon icon={faBook} /> <strong>Course:</strong> {profile.course}</p>}
                    {profile?.address && <p><FontAwesomeIcon icon={faMapMarkerAlt} /> <strong>Address:</strong> {profile.address}</p>}
                    {profile?.contactNumber && <p><FontAwesomeIcon icon={faPhone} /> <strong>Contact Number:</strong> {profile.contactNumber}</p>}
                    {profile?.birthdate && <p><FontAwesomeIcon icon={faCalendarAlt} /> <strong>Birthdate:</strong> {new Date(profile.birthdate).toLocaleDateString()}</p>}

                    {/* Display new fields with icons */}
                    {profile?.gender && (
                        <p>
                            <FontAwesomeIcon icon={faVenusMars} /> <strong>Gender:</strong> {profile.gender}
                        </p>
                    )}
                    {profile?.section && (
                        <p>
                            <FontAwesomeIcon icon={faBook} /> <strong>Section:</strong> {profile.section}
                        </p>
                    )}
                    {profile?.school_year && (
                        <p>
                            <FontAwesomeIcon icon={faCalendarAlt} /> <strong>School Year:</strong> {profile.school_year}
                        </p>
                    )}
                </section>
                <section className='privacy'>
                    <p>At <strong>Library Management System</strong>, we deeply respect your data privacy and are committed
                        to safeguarding your personal information. We achieve this through transparent practices,
                        ensuring we collect only the data necessary to provide our services effectively. Furthermore,
                        we believe in empowering you with control over your information and have implemented robust
                        security measures to protect it from unauthorized access or misuse. Importantly, your
                        personal data is never sold to third parties.</p>

                    <p>For a comprehensive understanding of our commitment to protecting your information,
                        we encourage you to review our full Privacy Policy. Should you have any questions or
                        concerns regarding your data privacy, please do not hesitate to contact us at
                        librarymanagementsystem.ustp@gmail.com, as your trust and security are paramount to us.</p>
                    <p style={{ fontStyle: 'italic' }}>Library Management System Team</p>
                </section>
            </section>
        </section>
    );
}

export default UserUserProfiles;