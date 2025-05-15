// components/UserDetailsModal.jsx
import React from 'react';
import './UserDetailsModal.css'; // Create this CSS file
import { FaIdCard, FaUser, FaEnvelope, FaUserCircle, FaBriefcase, FaGraduationCap, FaCalendarAlt, FaVenusMars, FaMapMarkerAlt, FaPhoneAlt, FaSchool } from 'react-icons/fa'; // Example icons
import { FaUserSlash } from 'react-icons/fa'; // Icon for no profile

function UserDetailsModal({ user, onClose }) {
    if (!user) {
        return null;
    }

    return (
        <div className="userDetailsModalOverlay">
            <div className="userDetailsModal">
                <h2>User Details</h2>
                <div className="profileHeader">
                    {user.profile_picture ? (
                        <div className="modalProfilePictureContainer">
                            <img
                                src={`https://appdev-integrative-28.onrender.com${user.profile_picture}`}
                                alt={`${user.username}'s Profile`}
                                className="modalLargeProfilePicture"
                            />
                        </div>
                    ) : (
                        <div className="noProfileContainer">
                            <div className="noProfileCircle">
                                <FaUserSlash className="noProfileIcon" />
                            </div>
                        </div>
                    )}
                    <p className="largeFullname">{user.fullname || user.username || 'N/A'}</p>
                </div>
                <div className="modalUserDetailsColumn">
                    <div className='details'>
                        <p><FaIdCard className="detailIcon" /> <strong>ID:</strong> {user.id || 'N/A'}</p>
                        <p><FaUser className="detailIcon" /> <strong>Username:</strong> {user.username}</p>
                        <p><FaEnvelope className="detailIcon" /> <strong>Email:</strong> {user.email}</p>
                        <p><FaUserCircle className="detailIcon" /> <strong>Fullname:</strong> {user.fullname || 'N/A'}</p>
                        <p><FaBriefcase className="detailIcon" /> <strong>Role:</strong> {user.role || 'N/A'}</p>
                        <p><FaGraduationCap className="detailIcon" /> <strong>Student ID:</strong> {user.studentId || 'N/A'}</p>
                        <p><FaCalendarAlt className="detailIcon" /> <strong>Age:</strong> {user.age || 'N/A'}</p>
                    </div>
                    <div className='details'>
                        <p><FaSchool className="detailIcon" /> <strong>Course:</strong> {user.course || 'N/A'}</p>
                        <p><FaCalendarAlt className="detailIcon" /> <strong>Birthdate:</strong> {user.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'N/A'}</p>
                        <p><FaVenusMars className="detailIcon" /> <strong>Gender:</strong> {user.gender || 'N/A'}</p>
                        <p><FaMapMarkerAlt className="detailIcon" /> <strong>Section:</strong> {user.section || 'N/A'}</p>
                        <p><FaSchool className="detailIcon" /> <strong>School Year:</strong> {user.school_year || 'N/A'}</p>
                        <p><FaMapMarkerAlt className="detailIcon" /> <strong>Address:</strong> {user.address || 'N/A'}</p>
                        <p><FaPhoneAlt className="detailIcon" /> <strong>Contact:</strong> {user.contactNumber || 'N/A'}</p>
                    </div>
                </div>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default UserDetailsModal;