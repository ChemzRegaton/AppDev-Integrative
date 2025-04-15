// EditBookPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './addBookPanel.css'; // Reuse or create a specific CSS for edit

function EditBookPanel({ bookId, onClose }) {
  const [editingBook, setEditingBook] = useState({
    title: '',
    author: '',
    publication_year: '',
    publisher: '',
    category: '',
    quantity: '',
    available_quantity: '',
    location: '',
    cover_image: null, // Add cover_image to the state (will hold File or URL)
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // To display preview
  const [currentImageName, setCurrentImageName] = useState(''); // To display current file name

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (bookId) {
        setIsSubmitting(true);
        setErrorMessage('');
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/library/books/${bookId}/`);
          setEditingBook(response.data);
          setSelectedImage(bookData.cover_image); 

          if (bookData.cover_image) {
            const parts = bookData.cover_image.split('/');
            setCurrentImageName(parts[parts.length - 1]);
          }
          // If there's an existing cover image URL, you might want to display a preview
          setSelectedImage(response.data.cover_image);
        } catch (error) {
          console.error('Error fetching book details:', error.response ? error.response.data : error.message);
          setErrorMessage(error.response ? JSON.stringify(error.response.data) : 'Failed to fetch book details.');
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    fetchBookDetails();
  }, [bookId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingBook(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEditingBook(prevState => ({
      ...prevState,
      cover_image: file, // Store the selected file object
    }));
    setSelectedImage(URL.createObjectURL(file)); // Create a preview URL
    setCurrentImageName(file ? file.name : ''); // Update displayed name
  };

  const handleEditBook = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      for (const key in editingBook) {
        formData.append(key, editingBook[key]);
      }
      // If a new image is selected, append it
      if (editingBook.cover_image instanceof File) {
        formData.append('cover_image', editingBook.cover_image);
      }

      const response = await axios.put( // Or axios.patch
        `http://127.0.0.1:8000/api/library/books/${bookId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Book updated successfully:', response.data);
      setSuccessMessage('Book updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating book:', error.response ? error.response.data : error.message);
      setErrorMessage(error.response ? JSON.stringify(error.response.data) : 'Failed to update book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <part className="addBookPanelContainer"> {/* Keep consistent class name */}
      <h1 style={{ color: 'white' }}>EDIT BOOK</h1>
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      {successMessage && <p className="successMessage">{successMessage}</p>}
      <form className="bookInput" onSubmit={(e) => { e.preventDefault(); handleEditBook(); }}>
        <section className="addInputs"> {/* Keep consistent class name */}
          <input
            className="input"
            placeholder="Title"
            name="title"
            value={editingBook.title}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            placeholder="Author"
            name="author"
            value={editingBook.author}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            placeholder="Year Published"
            name="publication_year"
            value={editingBook.publication_year || ''}
            onChange={handleChange}
          />
          <input
            className="input"
            placeholder="Publisher"
            name="publisher"
            value={editingBook.publisher || ''}
            onChange={handleChange}
          />
          <input
            className="input"
            placeholder="Category"
            name="category"
            value={editingBook.category || ''}
            onChange={handleChange}
          />
          <input
            className="input"
            placeholder="Quantity"
            type="number"
            name="quantity"
            value={editingBook.quantity || ''}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            placeholder="Available"
            type="number"
            name="available_quantity"
            value={editingBook.available_quantity || ''}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            placeholder="Location"
            name="location"
            value={editingBook.location || ''}
            onChange={handleChange}
          />
          <input
            type="file"
            className="input"
            name="cover_image"
            onChange={handleImageChange}
            accept="image/*"
          />
          {selectedImage && (
            <div style={{ marginTop: '10px' }}>
              <img src={selectedImage} alt="Cover Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
            </div>
          )}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </section>
      </form>
    </part>
  );
}

export default EditBookPanel;