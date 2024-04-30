import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../assets/styles/Register.scss';

const Register = () => {
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
      setUsernameError("Username is mandatory!");
      return;
    }

    signup();
  };

  const signup = async () => {
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

    console.log(response);

    const { url } = await response.json();

    // Redirect to verification URL
    window.location.href = url;
  };

  return (
    <div className={"mainContainer"}>
      <div className={"titleContainer"}>
        <div>Sign Up</div>
      </div>
      <br />
      <div className={"inputContainer"}>
        <input
          value={username}
          placeholder="Enter your username"
          onChange={(e) => setUsername(e.target.value)}
          className={"inputBox"}
        />
        <label className="errorLabel text-center">{usernameError}</label>
      </div>
      <br />
      <div className={"inputContainer"}>
        <input
          className={"inputButton"}
          type="button"
          onClick={onButtonClick}
          value={"Sign Up"}
        />
      </div>
      <div>
        Existing User? <Link to="/login">Login here</Link>
      </div>
    </div>
  );
};

export default Register;