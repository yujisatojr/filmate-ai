import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkCookies = async () => {
      const authSessionCookie = document.cookie.match("auth-session=([^;]+)");

      if (!authSessionCookie) {
        navigate("/login");
      } else {
        navigate("/login");
      }
    };

    checkCookies();
  }, [navigate]);

  return (
    <div>
      <p>Redirecting...</p>
    </div>
  );
};

export default Auth;