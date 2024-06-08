import React, { useState, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import FadeIn from './FadeIn';
import Grid from '@mui/material/Grid';
import MovieCard from './MovieCard';
import '../assets/styles/Profile.scss';

function Profile({ parentToChild }: any) {

    const {selectedProfile, user, isLoggedIn} = parentToChild;

    const [isUserFollowed, setIsUserFollowed] = useState<boolean>(false);
    const [isStatusChanged, setIsStatusChanged] = useState<boolean>(false);
    const [followersData, setFollowersData] = useState<any>(null);

    const [followersInfoData, setFollowersInfoData] = useState<any>(null);
    const [followeesInfoData, setFolloweesInfoData] = useState<any>(null);

    const [favoriteIds, setFavoriteIds] = useState<any>([]);
    const [favoritesData, setFavoritesData] = useState<any>(null);
    const [savedIds, setSavedIds] = useState<any>([]);
    const [savedData, setSavedData] = useState<any>(null);

    const [movieDetail, setMovieDetail] = useState<any>(null);
    const [clickedDetail, setClickedDetail] = useState<boolean>(false);
    const [clickedProfile, setClickedProfile] = useState<boolean>(false);

    const [selectedProfileElement, setSelectedProfileElement] = useState({
		username: '',
		email: '',
		user_id: '',
		picture_url: ''
	});

    const handleClickedChange = () => {
		setClickedDetail(false)
	};
		
	const handleClick = (movie: any) => {
		setMovieDetail(movie);
		setClickedDetail(true);
        setClickedProfile(false);
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

    useEffect(() => {
        const getFollower = async () => {
            try {
                const response = await fetch(`/get_follower?follower_id=${user.userId}&followee_id=${selectedProfile.user_id}`, {
                    method: "GET"
                });
        
                if (response.ok) {
                    const data = await response.json();
                    if (data.message === 'exists') {
                        setIsUserFollowed(true);
                    } else if (data.message === 'not found') {
                        setIsUserFollowed(false);
                    }
                } else {
                    throw new Error("Failed to fetch following status.");
                }
            
            } catch (error) {
                console.log(error);
            }
        }

        getFollower();
    }, [user, selectedProfile, isStatusChanged])

    const followUser = async (follower_id: string, followee_id: string) => {
        try {
            const response = await fetch("/follower", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "follower_id": follower_id,
                    "followee_id": followee_id
                })
            });
    
            if (response.ok) {
                setIsStatusChanged(prevStatus => !prevStatus);
            } else {
                throw new Error("Failed to follow a user.");
            }
        
        } catch (error) {
            console.log(error);
        }
    }

    const unfollowUser = async (follower_id: string, followee_id: string) => {
        try {
            const response = await fetch("/follower", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "follower_id": follower_id,
                    "followee_id": followee_id
                })
            });
    
            if (response.ok) {
                setIsStatusChanged(prevStatus => !prevStatus);
            } else {
                throw new Error("Failed to unfollow a user.");
            }
        
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const getFollowers = async () => {
            try {
                const response = await fetch("/get_followers", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "user_id": selectedProfile.user_id
                    })
                });
        
                if (response.ok) {
                    // setIsStatusChanged(prevStatus => !prevStatus);
                    const data = await response.json();
                    setFollowersData(data);
                } else {
                    throw new Error("Failed to get followers and followees.");
                }
            
            } catch (error) {
                console.log(error);
            }
        }

        getFollowers();
    }, [selectedProfile, isStatusChanged])

    useEffect(() => {
        const getFollowersData = async () => {
            const followers_ids = followersData.results_followers.map((user: any) => user.user_id);
            try {
                const response = await fetch("/get_users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "user_ids": followers_ids
                    })
                });
        
                if (response.ok) {
                    // setIsStatusChanged(prevStatus => !prevStatus);
                    const data = await response.json();
                    setFollowersInfoData(data);
                } else {
                    throw new Error("Failed to get followers info.");
                }
            
            } catch (error) {
                console.log(error);
            }
        }

        const getFolloweesData = async () => {
            const followees_ids = followersData.results_followees.map((user: any) => user.user_id);
            try {
                const response = await fetch("/get_users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "user_ids": followees_ids
                    })
                });
        
                if (response.ok) {
                    // setIsStatusChanged(prevStatus => !prevStatus);
                    const data = await response.json();
                    setFolloweesInfoData(data);
                } else {
                    throw new Error("Failed to get followees info.");
                }
            
            } catch (error) {
                console.log(error);
            }
        }

        if (followersData) {
            if (followersData.followers_count > 0) {
                getFollowersData();
            } else {
                setFollowersInfoData({});
            }
    
            if (followersData.followees_count > 0) {
                getFolloweesData();
            } else {
                setFolloweesInfoData({});
            }
        }
    }, [followersData])

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedProfile) return;

            try {
                const response = await fetch("/query_favorites", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "user_id": selectedProfile.user_id
                    })
                });

                const data = await response.json();

                const filmIds: any[] = [];
                data.favorites.forEach(function(favorite: any) {
                    filmIds.push(favorite.film_id);
                });

                setFavoriteIds(filmIds);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [selectedProfile]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/index_favorites", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "id_list": favoriteIds
                    })
                });

                const data = await response.json();
                setFavoritesData(data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [favoriteIds]);

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedProfile) return;

            try {
                const response = await fetch("/query_bookmarks", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "user_id": selectedProfile.user_id
                    })
                });

                const data = await response.json();

                const filmIds: any[] = [];
                data.bookmarks.forEach(function(bookmark: any) {
                    filmIds.push(bookmark.film_id);
                });

                setSavedIds(filmIds);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [selectedProfile]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/index_bookmarks", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "id_list": savedIds
                    })
                });

                const data = await response.json();
                setSavedData(data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [savedIds]);

    return (
    <>
        {!clickedDetail && !clickedProfile && (
        <div className="profile_root">
            {isLoggedIn && selectedProfile && (
            <FadeIn transitionDuration={700}>
                <div className='profile_close_btn'>
                    <a href="/"><CloseIcon fontSize="inherit"/></a>
                </div>
                <div className="profile_header">
                    <img className='image_circle' alt={selectedProfile.username} src={selectedProfile.picture_url}/>
                    <div>
                        <h1>{selectedProfile.username}</h1>
                        <div className="followers_numbers">
                            <span>{followersData && followersData.followees_count} Following</span>
                            <span>{followersData && followersData.followers_count} Followers</span>
                        </div>
                        {!isUserFollowed && (
                            <div className="follow_btn" onClick={() => {followUser(user.userId, selectedProfile.user_id);}}>
                                <span>Follow</span>
                            </div>
                        )}
                        {isUserFollowed && (
                            <div className="follow_btn" onClick={() => {unfollowUser(user.userId, selectedProfile.user_id);}}>
                                <span>Unfollow</span>
                            </div>
                        )}                    
                    </div>
                </div>

                <div className="profile_mylist_container">
                    <h3>Favorites</h3>
                    {favoritesData && favoritesData.length === 0 && (
                        <p>This user doesn't have a favorite list.</p>
                    )}
                    <Grid container spacing={2} className='result_container'>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <Grid container spacing={2}>
                            {favoritesData && favoritesData.map((movie: any, index: number) => (
                                <Grid item xs={6} sm={6} md={2} lg={2} xl={2} key={index}>
                                    <FadeIn transitionDuration={700} key={index}>
                                        <div key={index} className='movie_img zoom' onClick={() => handleClick(movie)}>
                                            <img className='image_fill' alt={movie.title} src={movie.img}/>
                                        </div>
                                    </FadeIn>
                                </Grid>
                            ))}
                            </Grid>
                        </Grid>
                    </Grid>

                    <h3>Saved</h3>
                    {savedData && savedData.length === 0 && (
                        <p>This user doesn't have a saved list.</p>
                    )}
                    <Grid container spacing={2} className='result_container'>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <Grid container spacing={2}>
                            {savedData && savedData.map((movie: any, index: number) => (
                                <Grid item xs={6} sm={6} md={2} lg={2} xl={2} key={index}>
                                    <FadeIn transitionDuration={700} key={index}>
                                        <div key={index} className='movie_img zoom' onClick={() => handleClick(movie)}>
                                            <img className='image_fill' alt={movie.title} src={movie.img}/>
                                        </div>
                                    </FadeIn>
                                </Grid>
                            ))}
                            </Grid>
                        </Grid>
                    </Grid>

                    <h3>Followers</h3>
                    <div className="follows_container">
                    {followersData && followersData.followers_count !== 0 && followersInfoData && Object.keys(followersInfoData).length > 0 ? (
                        followersInfoData.users.map((user: any, index: number) => (
                        <div className="follows_element">
                            <img key={index} className="image_circle circle_zoom" alt={user.username} src={user.picture_url} onClick={() => {handleProfileClick(user)}}/>
                            <span>{user.username}</span>
                        </div>
                        ))
                    ) : (
                        <p>No followers found.</p>
                    )}
                    </div>
                    <h3>Following</h3>
                    <div className="follows_container">
                    {followersData && followersData.followees !== 0 && followeesInfoData && Object.keys(followeesInfoData).length > 0 ? (
                        followeesInfoData.users.map((user: any, index: number) => (
                        <div className="follows_element">
                            <img key={index} className="image_circle circle_zoom" alt={user.username} src={user.picture_url} onClick={() => {handleProfileClick(user)}}/>
                            <span>{user.username}</span>
                        </div>
                        ))
                    ) : (
                        <p>Not following anybody yet.</p>
                    )}
                    </div>
                </div>
            </FadeIn>
            )}
        </div>
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
    </>
  );
};

export default Profile;