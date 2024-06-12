import React, { useState, useEffect } from "react";
import FadeIn from './FadeIn';
import MovieCard from './MovieCard';
import Profile from './Profile';
import { ThreeDots } from 'react-loader-spinner'
import { styled } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import { withAuthInfo } from '@propelauth/react';
import '../assets/styles/Explore.scss';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SearchIcon from '@mui/icons-material/Search';

interface FilterChoice {
    mode: string;
    user_ids: string[];
}

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

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userData, setUserData] = useState<any>(null);
    const [userResultData, setUserResultData] = useState<any>(null);
    const [filterChoice, setFilterChoice] = useState<FilterChoice>({
        mode: 'all',
        user_ids: [],
    });
    const [isClicked, setIsClicked] = useState<number | null>(null);

    const [usersData, setUsersData] = useState<any>(null);
    const [reviewsData, setReviewsData] = useState<any>(null);

    const [movieDetail, setMovieDetail] = useState<any>(null);
    const [clickedDetail, setClickedDetail] = useState<boolean>(false);

    const [clickedProfile, setClickedProfile] = useState<boolean>(false);
    const [selectedProfileElement, setSelectedProfileElement] = useState({
		username: '',
		email: '',
		user_id: '',
		picture_url: ''
	});

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

    const handleClickedChange = () => {
		setClickedDetail(false)
	};
		
	const handleClick = (movie: any) => {
		setMovieDetail(movie);
		setClickedDetail(true);
	};

    const handleMovieChange = (data: any) => {
		setMovieDetail(data);
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};

    const handleProfileClick = (userElement: any) => {
		setSelectedProfileElement({
			username: userElement.username,
			email: userElement.email,
			user_id: userElement.user_id,
			picture_url: userElement.picture_url,
		})

		setClickedProfile(true);
		setClickedDetail(false);
	};

    const handleFollowerClick = (userId: string) => {
        setFilterChoice({
          mode: 'followers',
          user_ids: [userId],
        });
    };

    // Get user's following user data
    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const response = await fetch("/get_followers", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "user_id": user.userId,
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    const followingIds: any[] = [];
                    data.results_followees.forEach((followee: any) => {
                        followingIds.push(followee.user_id);
                    });
                    getFollowingUsersDetail(followingIds);
                } else {
                    throw new Error("Failed to fetch following users.");
                }
            } catch (error) {
                console.log(error);
            }
        }
    
        const getFollowingUsersDetail = async (followingIds: any[]) => {
            try {
                const response = await fetch("/get_users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "user_ids": followingIds,
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsersData(data.users);
                } else {
                    throw new Error("Failed to fetch reviews.");
                }
            } catch (error) {
                console.log(error);
            }
        }
    
        fetchFollowing();
    }, []);

    // Get review data to be shown on the feed
    useEffect(() => {
        setIsLoading(true);
        const getReviews = async () => {
            try {
                const response = await fetch("/get_reviews", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(filterChoice)
                });
                if (response.ok) {
                    const data = await response.json();
                    setReviewsData(data);
                    setIsLoading(false);
                } else {
                    throw new Error("Failed to fetch reviews.");
                }
            } catch (error) {
                console.log(error);
            }
        }

        getReviews();
    }, [filterChoice])

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
        {userData && !clickedDetail && !clickedProfile && (
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
                                <div className={`${isClicked === index ? 'profile_clicked' : 'image_container'}`} onClick={() => {handleFollowerClick(item.user_id); setIsClicked(index);}}>
                                    <img key={index} src={item.picture_url} alt={`User ${index}`}/>
                                </div>
                                <span onClick={() => {handleFollowerClick(item.user_id); setIsClicked(index);}}>@{item.username}</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="activity_header">
                    <h3>Activity Feed</h3>
                    {filterChoice.mode !== 'all' && (
                        <Button variant="outlined" startIcon={<CloseIcon />} className="reset_filter_button" 
                            onClick={() => {
                            setIsClicked(null);
                            setFilterChoice({
                                mode: 'all',
                                user_ids: [],
                                })
                            }}
                        >
                            No Filter
                        </Button>
                    )}
                </div>
                {isLoading ? (
					<FadeIn transitionDuration={500}>
						<div className='loading'>
							<ThreeDots
							visible={true}
							height="60"
							width="60"
							color="white"
							radius="9"
							ariaLabel="three-dots-loading"
							wrapperStyle={{}}
							wrapperClass=""
							/>
						</div>
					</FadeIn>
                ) : (
                    reviewsData && reviewsData.count > 0 ? (
                        reviewsData.results.map((item: any, index: number) => (
                            <Item className='feed_card' key={index}>
                                <div className="feed_card_header">
                                    <img className='image_circle' alt={item.user.username} src={item.user.picture_url}/>
                                    <div className="feed_header_right">
                                        {item.review.comment === '' ? (
                                            <div><span onClick={() => {handleProfileClick(item.user)}}>@{item.user.username}</span> has watched <span onClick={() => handleClick(item.film)}>{item.film.title}</span></div>
                                        ) : (item.review.comment !== '' && item.review.rating === 0) ? (
                                            <div><span onClick={() => {handleProfileClick(item.user)}}>@{item.user.username}</span> has commented on <span onClick={() => handleClick(item.film)}>{item.film.title}</span></div>
                                        ) : (
                                            <div><span onClick={() => {handleProfileClick(item.user)}}>@{item.user.username}</span> has rated <span onClick={() => handleClick(item.film)}>{item.film.title}</span></div>
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
                        <p className="no_feed_message"><RocketLaunchIcon/>You are all caught up!</p>
                    )
                )}
            </div>
        </FadeIn>
        )}

        {!clickedProfile && (
        <React.StrictMode>
            <MovieCard
            parentToChild={{ movieDetail, clickedDetail }}
            movieChange={handleMovieChange}
            clickedChange={handleClickedChange}
            />
        </React.StrictMode>
        )}

        {clickedProfile && !clickedDetail && (
        <React.StrictMode>
            <Profile 
            parentToChild={{ selectedProfile: selectedProfileElement, user: user, isLoggedIn: isLoggedIn }}
            movieChange={handleMovieChange}
            />
        </React.StrictMode>
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