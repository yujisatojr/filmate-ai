import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { withAuthInfo } from '@propelauth/react';
import FadeIn from './FadeIn';
import '../assets/styles/MyList.scss';

function Explore({ isLoggedIn, user }: any) {
    
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        if (isLoggedIn) {
            setUserData(user);
        } else {
            navigate('/');
        }
    }, [isLoggedIn, user]);

  return (
    <div className="explore_root">
        <FadeIn transitionDuration={700}>
            <h1>Explore, Connect, Share.</h1>
        </FadeIn>
    </div>
  );
};

export default withAuthInfo(Explore);