import React, { useState } from 'react';
import axios from 'axios';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';
import './userHistoryLogs.css'; // Make sure you have the FAQ CSS
import Sidebar from './sideBar.jsx';

function FAQ() {
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [contactSubject, setContactSubject] = useState('');
    const [contactMessage, setContactMessage] = useState('');

    const faqData = [
        {
            question: 'How do I borrow a book?',
            answer: 'To borrow a book, navigate to the book catalog, find the book you want, and click the "Borrow" button. Ensure you are logged into your account and have no outstanding fines.',
        },
        {
            question: 'What is the loan period for books?',
            answer: 'The standard loan period for books is 14 days. You may be able to renew books depending on availability and library policies.',
        },
        {
            question: 'How do I return a book?',
            answer: 'You can return books at the library\'s circulation desk during opening hours. Some libraries may also have designated drop-off boxes for after-hours returns.',
        },
        {
            question: 'What happens if I return a book late?',
            answer: 'Overdue fines may be applied to late returns. The amount of the fine varies depending on the library\'s policy and the number of days the book is overdue. You can check your account for any outstanding fines.',
        },
        {
            question: 'Can I reserve a book that is currently checked out?',
            answer: 'Yes, you can reserve books that are currently checked out. Look for the "Reserve" or "Hold" button on the book\'s page in the catalog. You will be notified when the book becomes available.',
        },
        {
            question: 'How do I renew a borrowed book?',
            answer: 'You can usually renew borrowed books through your online account or by contacting the library. Renewals may be subject to certain conditions, such as the book not being on hold for another user.',
        },
        {
          question: 'Where can I find information about library hours and location?',
          answer: 'You can find information about our library hours, location, and contact details on the "Contact Us" page of our website or in the library\'s main lobby.',
      },
      {
          question: 'What resources other than books does the library offer?',
          answer: 'Our library offers a variety of resources including e-books, audiobooks, magazines, journals, DVDs, computers with internet access, and various online databases. Check our website or ask a librarian for more information.',
      },
        
        // Add more FAQ items here
    ];

    const toggleAnswer = (question) => {
        setExpandedQuestion(expandedQuestion === question ? null : question);
    };

    const handleSubjectChange = (event) => {
        setContactSubject(event.target.value);
    };

    const handleContactChange = (event) => {
        setContactMessage(event.target.value);
    };


    const handleSendMessage = async () => {
        const authToken = localStorage.getItem('authToken'); // Assuming you store the token

        try {
            const response = await axios.post(
                'https://appdev-integrative-28.onrender.com/api/auth/messages/send/', // Use your API endpoint
                {
                    subject: contactSubject,
                    message: contactMessage,
                },
                {
                    headers: {
                        'Authorization': `Token ${authToken}`, // Include your authentication token
                    },
                }
            );
            console.log('Message sent successfully:', response.data);
            setContactSubject('');
            setContactMessage('');
            alert('Message sent to admin!');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message.');
        }
    };

    return (
        <div className='dashboard'>
            <Sidebar />
            <section className='faq-container'>
                <ul className='faq-list'>
                <h1>Frequently Asked Questions</h1>
                    {faqData.map((item, index) => (
                        <li key={index} className='faq-item'>
                            <button className='question-button' onClick={() => toggleAnswer(item.question)}>
                                {item.question}
                                <span className={`arrow ${expandedQuestion === item.question ? 'expanded' : ''}`}>&#9660;</span>
                            </button>
                            {expandedQuestion === item.question && (
                                <div className='answer'>
                                    <p>{item.answer}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

            <div className='contact-admin'>
                    <h1>Message Us</h1>
                    <div className='contact-form'>
                        <p>Subject:</p>
                        <input
                            type="text"
                            placeholder="Subject"
                            value={contactSubject}
                            onChange={handleSubjectChange}
                            className='subject-input'
                        />
                        <p>Message:</p>
                        <textarea
                            placeholder="Leave a message for the admin..."
                            value={contactMessage}
                            onChange={handleContactChange}
                            className='message-input'
                        />
                        <div className='button-container'>
                            <button onClick={handleSendMessage} className='send-button'>Send Message</button>
                            <button onClick={() => { setContactSubject(''); setContactMessage(''); }} className='clear-button'>Clear</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default FAQ;