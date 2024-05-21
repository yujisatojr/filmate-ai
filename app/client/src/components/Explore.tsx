import React, { useState, useEffect } from "react";
import FadeIn from './FadeIn';
import { styled } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import { withAuthInfo } from '@propelauth/react';
import '../assets/styles/Explore.scss';

import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';

function Explore({ isLoggedIn, user, selectedProfileChange }: any) {
    
    const navigate = useNavigate();

    const [userData, setUserData] = useState<any>(null);
    const [userResultData, setUserResultData] = useState<any>(null);

    const [modalOpen, setModalOpen] = React.useState(false);
    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);

    const [searchInput, setSearchInput] = useState<string>('');
    const [keyword, setKeyword] = useState<string>('');

    const Item = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(1),
        textAlign: 'left',
    }));

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchInput(e.target.value);
	};

    const handleSearchSubmit = () => {
		setKeyword(searchInput);
	};

    useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(`/search_users?keyword=${keyword}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserResultData(data);
                } else {
                    console.error('Error searching users.');
                }
			} catch (error) {
				console.log(error);
			}
		};

        fetchData();

		return () => {
			// Cancel any ongoing requests here if needed
		};
	}, [keyword]);

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
                <Fab color="primary" aria-label="add" onClick={() => handleOpen()}>
                    <AddIcon/>
                </Fab>
                <h3>Activity</h3>
                <Item className='feed_card'>
                    <p>Contents come here</p>
                </Item>
            </div>
        </FadeIn>
        )}

        <Modal
            open={modalOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className='search_user_modal' sx={style}>
                <div className='search_form_wrapper'>
                    <Paper
                    className='search_form'
                    component="form"
                    sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearchSubmit();
                    }}
                    >
                        <InputBase
                        className='input_form'
                        sx={{ ml: 1, flex: 1 }}
                        placeholder='Find users'
                        inputProps={{ 'aria-label': 'search users' }}
                        value={searchInput}
                        onChange={handleInputChange}
                        />
                        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                    </Paper>
                </div>
                {(userResultData && userResultData.results.length > 0) ? (
                    <div className="user_results_container">
                        {userResultData.results.map((result: any, index: number) => (
                        <div className="result_card" key={index} onClick={() => selectedProfileChange(result)}>
                            <div className="user_results_left">
                                <img className='image_circle' alt={result.username} src={result.picture_url}/>
                                <h1>@{result.username}</h1>
                            </div>
                            <span>View</span>
                        </div>
                        ))}
                    </div>
                ) : (
                    <p className="no_results">No results</p>
                )}
            </Box>
        </Modal>
    </div>
  );
};

export default withAuthInfo(Explore);