import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from './FadeIn';
import '../assets/styles/Profile.scss';

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCookies = async () => {
      const authSessionCookie = document.cookie.match("auth-session=([^;]+)");
      // console.log(authSessionCookie)

      if (!authSessionCookie) {
        navigate("/");
        return false;
      }

      return true;
    };

    const fetchData = async () => {
      const cookiesValid = await checkCookies();
      if (!cookiesValid) return;

      try {
        const response = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        // console.log(data)
        setUserData([data.username, data.email]);
      } catch (error) {
        navigate("/");
      }
    };

    fetchData();
  }, [navigate]);

  // const handleLogout = () => {
  //   document.cookie = `auth-session=; max-age=0`;
  //   navigate("/");
  // };

  return (
    <div className="profile_root">
    {userData && (
      <FadeIn transitionDuration={700} className="profile_contents">
        <h1>Welcome, {userData[0]}!</h1>
        <p>You're logged in with {userData[1]}</p>
      </FadeIn>
    )}
    </div>
  );
};

export default Profile;