import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { withAuthInfo } from '@propelauth/react';
import FadeIn from './FadeIn';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import '../assets/styles/Explore.scss';

function Explore({ isLoggedIn, user }: any) {
    
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);

    const Item = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(1),
        textAlign: 'left',
    }));

    useEffect(() => {
        if (isLoggedIn) {
            setUserData(user);
        } else {
            navigate('/');
        }
    }, [navigate, isLoggedIn, user]);

  return (
    <div className="explore_root">
        {userData && (
        <FadeIn transitionDuration={700}>
            <div className="explore_middle_container">
                <Fab color="primary" aria-label="add">
                    <AddIcon />
                </Fab>
                <h3>Activity</h3>
                <Item className='feed_card'>
                    <p>Contents come here.</p>
                </Item>
            </div>
        </FadeIn>
        )}
    </div>
  );
};

export default withAuthInfo(Explore);