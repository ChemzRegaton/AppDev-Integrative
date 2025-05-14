import React from 'react';
import logoImage from '../assets/Raven1.png';
import './userHistoryLogs.css'; // Assuming you'll create this CSS file
import Sidebar from './sideBar.jsx';
import lead from '../assets/regaton.png'
import teamMemberDefault from '../assets/male.jpg'; // Default image for team members
import ui from '../assets/Enterina.png'
import doc from '../assets/Dadang.png'


function AboutUs() {
    const currentYear = new Date().getFullYear();

    return (
        <div className='dashboard' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Sidebar />
            <section className='about-us-container'>

                <section className='meet-the-team'>
                    <h1>Meet the Team</h1>
                    <section className='team-container' style={{ width: '120%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'start'}}>
                        <section className='leadDeveloper' style={{display: 'flex', flexDirection: 'column'}}>
                            <img src={lead} alt="Library Logo" className='library-logo' style={{marginTop: '-82px'}}/>
                            <h2 style={{marginTop: '-72px'}}>Chembee Regaton</h2>
                            <h3 style={{fontWeight: 'lighter', marginTop: '-30px'}}>Lead Developer</h3>
                        </section>
                        <section className='leadDeveloper' style={{display: 'flex', flexDirection: 'column'}}>
                            <img src={ui} alt="Library Logo" className='library-logo' style={{marginTop: '-82px'}}/>
                            <h2 style={{marginTop: '-72px'}}>Jeany Entirina</h2>
                            <h3 style={{fontWeight: 'lighter', marginTop: '-30px'}}>UI/UX Designer</h3>
                        </section>
                        <section className='leadDeveloper' style={{display: 'flex', flexDirection: 'column'}}>
                            <img src={doc} alt="Library Logo" className='library-logo' style={{marginTop: '-82px'}}/>
                            <h2 style={{marginTop: '-72px'}}>Arriane Dadang</h2>
                            <h3 style={{fontWeight: 'lighter', marginTop: '-30px'}}>Documentation</h3>
                        </section>
                    </section>
                </section>

                <section className='contact-us'>
                    <h2>Contact Us</h2>
                    <p>We'd love to hear from you! If you have any questions, suggestions, or just want to say hello, please reach out through the following channels:</p>
                    <ul>
                        <li>Email: librarymanagementsystem@gmail.com</li>
                        <li>Phone: +63 (948) 527-3965</li>
                        <li>Address: C.M Recto Avenue, Lapasan, Cagayan de Oro City</li>
                    </ul>
                </section>

                <p className='copyright'>&copy; {currentYear} The Library Management System. All rights reserved.</p>
            </section>
        </div>
    );
}

export default AboutUs;