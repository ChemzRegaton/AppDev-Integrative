
// AddBookPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './additionalInfo.css'; // Create this CSS file

function AdditionalInfo({ onClose }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    publication_year: '',
    publisher: '',
    category: '',
    quantity: '',
    available_quantity: '',
    location: '',
  });
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="addBookPanelContainer">
      <h2 style={{ color: 'white' }}>Additional Information:</h2>
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      {successMessage && <p className="successMessage">{successMessage}</p>}
      <form className="bookInput" onSubmit={(e) => { e.preventDefault(); handleAddBook(); }}>
        <section className="addInputs">
          <p style={{color: 'white', margin: '-4px'}}>Fullname:</p>
          <input
            className="input"
            placeholder="Fullname"
            name="fullname"
          />
        <p style={{color: 'white', margin: '-4px'}}>Role:</p>
          <select id="role" name="role" placeholder="Role">
            <option value="Student">Student</option>
            <option value="BSCPE">Faculty/Staff</option>
            <option value="BSArch">Guest</option>
           </select>

          <p style={{color: 'white', margin: '1px'}}>Student ID: (If Student or Faculty/Staff)</p>
          <input
            className="input"
            placeholder="Student ID"
            name="studentId"
          />
           <p style={{color: 'white', margin: '-4px'}}>Age:</p>
          <input type="number" id="age" name="age" min="5" max="500" placeholder='Age'></input>
          <p style={{color: 'white', margin: '-4px'}}>Course:</p>
          <select id="course" name="course" placeholder="Course">
            <option value="BSIT">BSIT</option>
            <option value="BSCPE">BSCPE</option>
            <option value="BSArch">BSArch</option>
            <option value="BSMT">BSMT</option>
            <option value="BSDS">BSDS</option>
           </select>
           
          <p style={{color: 'white', margin: '-4px'}}>Address:</p>
          <input
            className="input"
            type='address'
            placeholder="Address"
            name="address"
          />
          <p style={{color: 'white', margin: '-4px'}}>Contact Number:</p>
          <input
            className="input"
            type='tel'
            placeholder="Contact Number"
            name="contactNumber"
          />
          <p style={{color: 'white', margin: '-4px'}}>Birthdate:</p>
          <input
            className="input"
            type='date'
            placeholder="Birthdate"
            name="contactNumber"
          />
        </section>
        <button className='submit' >Submit</button>
      </form>
    </div>
  );
}

export default AdditionalInfo;