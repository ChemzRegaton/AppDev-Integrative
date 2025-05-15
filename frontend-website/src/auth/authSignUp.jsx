import { useState } from 'react';
import axios from 'axios';
import './authSignUp.css';
import logoImage from '../assets/LOGO_WORD.png';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');

      const response = await axios.post('https://appdev-integrative-28.onrender.com/api/auth/register/', {
        username,
        email,
        password,
        password2: confirmPassword, // match Django field
      });

      if (response.status === 201 || response.status === 200) {
        alert('Registration successful! Please log in.');
        navigate('/');
      }
  };

  const goToLogin = () => {
    navigate('/');
  };

  return (
    <div className='signup'>
      <section
        style={{
          backgroundImage: `url(${logoImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '80vh',
        }}
      ></section>

      <section>
        <div className='signUpContainer'>
          <h1 style={{ color: 'white' }}>REGISTRATION</h1>
          {error && <p style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</p>}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <button onClick={handleSignUp}>SIGN UP</button>

          <div style={{
            display: 'flex',
            width: '50%',
            height: '10%',
            gap: '4px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <p style={{color: 'white'}}>Already have an account?</p>
            <p
              style={{ color: '#FAA61A', fontWeight: '500', cursor: 'pointer' }}
              onClick={goToLogin}
            >
              Log in
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SignUp;
