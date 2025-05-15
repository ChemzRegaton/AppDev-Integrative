// AddBookPanel.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './addBookPanel.css'; // Create this CSS file

function AddBookPanel({ onClose }) {
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    publication_year: '',
    publisher: '',
    category: '',
    quantity: '',
    available_quantity: '',
    location: '',
    cover_image: null, // Add cover_image to the state
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setNewBook(prevState => ({
      ...prevState,
      cover_image: e.target.files[0], // Store the selected file object
    }));
  };

  const handleAddBook = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      for (const key in newBook) {
        formData.append(key, newBook[key]);
      }

      const response = await axios.post('https://appdev-integrative-28.onrender.com/api/library/books/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });
      console.log('Book added successfully:', response.data);
      setSuccessMessage('Book added successfully!');
      setNewBook({
        title: '',
        author: '',
        publication_year: '',
        publisher: '',
        category: '',
        quantity: '',
        available_quantity: '',
        location: '',
        cover_image: null,
      });
      onClose();
    } catch (error) {
      console.error('Error adding book:', error.response ? error.response.data : error.message);
      setErrorMessage(error.response ? JSON.stringify(error.response.data) : 'Failed to add book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='overlay'>
      <part className="addBookPanelContainer">
      <h1 style={{ color: 'white' }}>ADD NEW BOOK</h1>
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      {successMessage && <p className="successMessage">{successMessage}</p>}
      <form className="bookInput" onSubmit={(e) => { e.preventDefault(); handleAddBook(); }}>
        <section className="addInputs">
          <input
            className="input"
            placeholder="Title"
            name="title"
            value={newBook.title}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            placeholder="Author"
            name="author"
            value={newBook.author}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            placeholder="Year Published"
            name="publication_year"
            value={newBook.publication_year}
            onChange={handleChange}
          />
          <input
            className="input"
            placeholder="Publisher"
            name="publisher"
            value={newBook.publisher}
            onChange={handleChange}
          />
          <input
            className="input"
            placeholder="Category"
            name="category"
            value={newBook.category}
            onChange={handleChange}
          />
          <input
            className="input"
            placeholder="Quantity"
            type="number"
            name="quantity"
            value={newBook.quantity}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            placeholder="Available"
            type="number"
            name="available_quantity"
            value={newBook.available_quantity}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            placeholder="Location"
            name="location"
            value={newBook.location}
            onChange={handleChange}
          />
          <input
            type="file"
            className="input"
            name="cover_image"
            onChange={handleImageChange}
            accept="image/*" // Optional: Restrict to image files
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Book'}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </section>
      </form>
    </part>

    </div>
  );
}

export default AddBookPanel;