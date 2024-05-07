import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../assets/styles/Register.scss';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import SendIcon from '@mui/icons-material/Send';

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = checkCookies();
    if (isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const checkCookies = () => {
    const authSessionCookie = document.cookie.match("auth-session=([^;]+)");

    return !!authSessionCookie;
  };

  const onButtonClick = () => {
    setUsernameError("");

    if ("" === username) {
      setUsernameError("Username is required!");
      return;
    }

    login();
  };

  const login = async () => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
      }),
      credentials: "include",
    });

    const { url } = await response.json();

    // Redirect to verification URL
    window.location.href = url;
  };

  return (
    <div className='main_container'>
      <div className='title_container'>
        <h1>Login</h1>
      </div>

      <div className='search_form_wrapper'>
        <Paper
        className='search_form'
        component="form"
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '400px' }}
        onSubmit={(e) => {
          e.preventDefault();
          onButtonClick();
        }}
        >
          <InputBase
          className='input_form'
          sx={{ ml: 1, flex: 1 }}
          placeholder='Enter your username'
          inputProps={{ 'aria-label': 'login' }}
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          />
          <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
            <SendIcon />
          </IconButton>
        </Paper>
        {usernameError !== '' && (<span className="validation">{usernameError}</span>)}
      </div>

      <span>
        New User? <Link to="/signup">Sign up here</Link>
      </span>
    </div>
  );
};

export default Login;