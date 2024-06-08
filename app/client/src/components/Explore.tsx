import React, { useState, useEffect } from "react";
import FadeIn from './FadeIn';
import { styled } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import { withAuthInfo } from '@propelauth/react';
import '../assets/styles/Explore.scss';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import SearchIcon from '@mui/icons-material/Search';

function formatDateString(dateString: string) {
    const date = new Date(dateString);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const timeString = `${hours}:${strMinutes} ${ampm}`;

    const day = date.getUTCDate();
    const monthIndex = date.getUTCMonth();
    const year = date.getUTCFullYear();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateStringFormatted = `${monthNames[monthIndex]} ${day < 10 ? '0' + day : day}, ${year}`;

    return `${timeString} - ${dateStringFormatted}`;
}

function Explore({ isLoggedIn, user, selectedProfileChange }: any) {
    
    const navigate = useNavigate();

    const [userData, setUserData] = useState<any>(null);
    const [userResultData, setUserResultData] = useState<any>(null);

    const [usersData, setUsersData] = useState<any>(null);
    const [reviewsData, setReviewsData] = useState<any>(null);

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
        width: 350,
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
        const getReviews = async () => {
            try {
                const response = await fetch("/get_reviews", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "mode": 'all',
                        "user_ids": [],
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    // console.log(data);
                    const user_array: any[] = [];
                    data.results.forEach((result: any) => {
                        const userExists = user_array.some(user => user.user_id === result.user.user_id);
                        if (!userExists) {
                            user_array.push(result.user);
                        }
                    });
                    setUsersData(user_array);

                    setReviewsData(data);
                } else {
                    throw new Error("Failed to fetch reviews.");
                }
            } catch (error) {
                console.log(error);
            }
        }

        getReviews();
    }, [])

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
                <div className="explore_header">
                    <div className="add_friend_btn">
                        <Fab color="primary" aria-label="add" onClick={() => handleOpen()}>
                            <AddIcon/>
                        </Fab>
                        <span>Add Friend</span>
                    </div>
                    {usersData && (
                        usersData.map((item: any, index: number) => (
                            <div className="add_friend_btn">
                                <div className="image_container">
                                    <img key={index} src={item.picture_url} alt={`User ${index}`} />
                                </div>
                                <span>@{item.username}</span>
                            </div>
                        ))
                    )}
                </div>
                <h3>Activity</h3>
                {reviewsData && reviewsData.count > 0 ? (
                    reviewsData.results.map((item: any, index: number) => (
                        <Item className='feed_card' key={index}>
                            <div className="feed_card_header">
                                <img className='image_circle' alt={item.user.username} src={item.user.picture_url}/>
                                <div className="feed_header_right">
                                    {item.review.comment === '' ? (
                                        <span>@{item.user.username} has watched <a href='/'>{item.film.title}</a></span>
                                    ) : (item.review.comment !== '' && item.review.rating === 0) ? (
                                        <span>@{item.user.username} has commented on <a href='/'>{item.film.title}</a></span>
                                    ) : (
                                        <span>@{item.user.username} has rated <a href='/'>{item.film.title}</a></span>
                                    )}
                                    <span className="date_posted"><AccessTimeIcon/> {formatDateString(item.review.date_added)}</span>
                                </div>
                            </div>
                            <div className="feed_card_body">
                                <Rating className="feed_card_rating" name="rating_star" value={item.review.rating} precision={1} max={5} readOnly />
                                <p>{item.review.comment}</p>
                                <span className="mobile_date_posted"><AccessTimeIcon/> {formatDateString(item.review.date_added)}</span>
                            </div>
                        </Item>
                    ))
                ) : (
                    <p className="no_feed_message">You are all caught up!</p>
                )}
                
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