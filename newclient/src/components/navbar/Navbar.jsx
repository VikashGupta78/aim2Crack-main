import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
// import jwt from 'jsonwebtoken';
// import aim2CrackLogo from '../../assets/images/navbar/Aim2Crack-logo.png';

function Navbar() {
  const code = window.location.pathname.split('/')[2];
  // console.log(code);
  const navigate = useNavigate();

  const excludedPaths = [
    '/register',
    '/login',
    '/forgot-password',
    `/quiz/${code}/test`,
    `/quiz/${code}/live`,
    `/quiz/${code}/feedback`
  ];

  // const [user, setUser] = useState(null);
  const [tokenState,setTokenState]=useState(false);
  // const [loading, setLoading] = useState(true); // Add loading state

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Function to check the login status
    const checkLoginStatus = async () => {
      if (!token) {
        // No token, navigate to login
        navigate('/login');
        // setTokenState(false);
      } else {
        // Token found, set tokenState to true
        setTokenState(true);
      }
      // Done checking, set loading to false
    };

    checkLoginStatus();
  }, [token]);
  
// // Add another useEffect to update tokenState when the token changes
// useEffect(() => {
//   setTokenState(Boolean(token));
// }, [token]);



  const location = useLocation();
  const isExcludedPath = excludedPaths.includes(location.pathname);
  if (isExcludedPath) {
    return null; // Render nothing if the current path is excluded
  }

    const openNav = () => {
    // Implement your logic for opening the navigation menu
  };

  const handleLogout = () => {
    // Implement the logout logic here
    // Clear the token from localStorage and update the user state if needed
    localStorage.removeItem('token');
    // setUser(null); // If you are using the `user` state, reset it to null upon logout
    setTokenState(false); // Update tokenState to false to indicate the user is logged out
    navigate('/login') // Redirect the user to the login page after logout
  };

  return (
    <header>
      {/* <img className="logo" src={aim2CrackLogo} alt="logo" title="home" /> */}

      <nav className="main-menu">
        <ul className="nav_links">
          <li><a href="#">Home</a></li>
          <li><a href="/summary">Dashboard</a></li>
          <li className="dropdown">
            {/* ... Quizzes dropdown contents ... */}
          </li>
          <li className="dropdown">
            {/* ... Placements dropdown contents ... */}
          </li>
          <li><a href="#">Talks</a></li>
          <li className="dropdown">
            {/* ... About dropdown contents ... */}
          </li>
          {tokenState && (
            <li className="user-info">
              <span className="material-icons"></span>
              {/* <span className="user-name">{user.displayName}</span> */}
              <button onClick={handleLogout}>Logout</button>
            </li>
          )}
          {!tokenState && (
            <li>
              <a href="/login">Login</a>
            </li>
          )}
        </ul>
      </nav>

      {/* ... Profile dropdown ... */}

      <span
        className="ham"
        style={{ fontSize: '30px', cursor: 'pointer' }}
        onClick={openNav}
      >
        &#9776;
      </span>
    </header>
  );
}

export default Navbar;
