import { useState } from 'react';
import axios from 'axios';
import './authLogin.css';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Sending username:", username);
    console.log("Sending password:", password);

    try {
      const response = await fetch("https://appdev-integrative-28.onrender.com/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Login successful:", data);
      // Store token, redirect, etc.
    } catch (error) {
      console.error("Login error:", error.message);
    }
  };  

  const goToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className='login'>
      <section style={{
        backgroundImage: `url(${logoImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '80vh'
      }}></section>

      <section>
        <div className='loginContainer'>
          <h1 style={{ color: 'white' }}>LOGIN</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <input
            type="text"
            placeholder='Username'
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder='Password'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>LOGIN</button>

          <div style={{
            display: 'flex',
            width: '50%',
            height: '10%',
            gap: '4px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <p style={{color: 'white'}}>Don't have an account yet?</p>
            <p
              style={{ color: '#FAA61A', fontWeight: '500', cursor: 'pointer' }}
              onClick={goToSignup}
            > Sign Up</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;