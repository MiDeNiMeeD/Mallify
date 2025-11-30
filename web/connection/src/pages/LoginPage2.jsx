import React, { useState } from 'react';
import './LoginPage2.css';

const LoginPage2 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign In');
  };

  return (
    <div className="login-container2" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/loginPicture.jpg)` }}>
      {/* Header */}
      <header className="header2">
        <div className="logo2">
          <img src={`${process.env.PUBLIC_URL}/mallify.png`} alt="Mallify Logo" className="logo-image2" />
          Mallify
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content2">
        {/* Left Side - Login Form */}
        <div className="login-section2">
          <div className="login-card2">
            <div className="card-header2">
              <h1>Sign in</h1>
              <button className="google-sign-btn2" onClick={handleGoogleSignIn}>
                <span className="google-text2">Sign with</span>
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
                  <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853"/>
                  <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05"/>
                  <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" fill="#EA4335"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group2">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Omar@beyond.com"
                  required
                />
              </div>

              <div className="form-group2">
                <div className="password-header2">
                  <label htmlFor="password">Password</label>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="*******"
                  required
                />
                 {/* <div className="password-header2">
                  <label htmlFor="password"></label>
                  <a href="#" className="forgot-link2">Forget password?</a>
                </div> */}
              </div>

              <button type="submit" className="signin-btn2">
                Sign in
              </button>
            </form>

          
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default LoginPage2;
