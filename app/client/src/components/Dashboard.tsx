import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../assets/styles/Dashboard.scss';

const Dashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCookies = async () => {
      const authSessionCookie = document.cookie.match("auth-session=([^;]+)");
      // console.log(authSessionCookie)

      if (!authSessionCookie) {
        navigate("/auth");
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
        navigate("/auth");
      }
    };

    fetchData();
  }, [navigate]);

  // const handleLogout = () => {
  //   document.cookie = `auth-session=; max-age=0`;
  //   navigate("/");
  // };

  return (
    <>
    {userData && (
      <div className="profile_root">
        <h1>Welcome, {userData[0]}!</h1>
        <p>You're logged in with {userData[1]}</p>
      </div>
    )}
    </>
  );
};

export default Dashboard;