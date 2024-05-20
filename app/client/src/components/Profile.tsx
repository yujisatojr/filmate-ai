import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { withAuthInfo } from '@propelauth/react';
import FadeIn from './FadeIn';
// import { styled } from '@mui/material/styles';
// import Paper from '@mui/material/Paper';
import '../assets/styles/Profile.scss';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Favorite from '@mui/icons-material/Favorite';
import Grid from '@mui/material/Grid';

function Profile({ parentToChild, movieChange, isLoggedIn, user }: any) {

    const {selectedProfile} = parentToChild;

    const [isUserFollowed, setIsUserFollowed] = useState<boolean>(false);
    const [isStatusChanged, setIsStatusChanged] = useState<boolean>(false);

    const [favoriteIds, setFavoriteIds] = useState<any>([]);
    const [favoritesData, setFavoritesData] = useState<any>(null);

    const [savedIds, setSavedIds] = useState<any>([]);
    const [savedData, setSavedData] = useState<any>(null);

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
                console.log('Successfully followed a user.')
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
                console.log('Successfully unfollowed a user.')
            } else {
                throw new Error("Failed to unfollow a user.");
            }
        
        } catch (error) {
            console.log(error);
        }
    }

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
                // console.log(data)

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
                // console.log(data)
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
                // console.log(data)

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
                // console.log(data)
                setSavedData(data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [savedIds]);
    
    // const navigate = useNavigate();
    // const [userData, setUserData] = useState<any>(null);

    // // const Item = styled(Paper)(({ theme }) => ({
    // //     padding: theme.spacing(1),
    // //     textAlign: 'left',
    // // }));

    // useEffect(() => {
    //     if (isLoggedIn) {
    //         setUserData(user);
    //     } else {
    //         navigate('/');
    //     }
    // }, [navigate, isLoggedIn, user]);

    // console.log(userData);

  return (
    <div className="profile_root">
        {isLoggedIn && selectedProfile && (
        <FadeIn transitionDuration={700}>
            <div className="profile_header">
                <img className='image_circle' alt={selectedProfile.username} src={selectedProfile.picture_url}/>
                <div>
                    <h1>{selectedProfile.username}</h1>
                    <div className="followers_numbers">
                        <span>1 Following</span>
                        <span>3 Followers</span>
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
                <div className="mylist_header">
                    <h3>Favorites</h3>
                    <Favorite/>
                </div>
                {favoritesData && favoritesData.length === 0 && (
                    <p>This user doesn't have a favorite list.</p>
                )}
                <Grid container spacing={2} className='result_container'>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Grid container spacing={2}>
                        {favoritesData && favoritesData.map((movie: any, index: number) => (
                            <Grid item xs={6} sm={6} md={2} lg={2} xl={2} key={index}>
                                <FadeIn transitionDuration={700} key={index}>
                                    <div key={index} className='movie_img zoom' onClick={() => movieChange(movie)}>
                                        <img className='image_fill' alt={movie.title} src={movie.img}/>
                                    </div>
                                </FadeIn>
                            </Grid>
                        ))}
                        </Grid>
                    </Grid>
                </Grid>

                <div className="mylist_header">
                    <h3>Saved</h3>
                    <BookmarkIcon/>
                </div>
                {savedData && savedData.length === 0 && (
                    <p>This user doesn't have a saved list.</p>
                )}
                <Grid container spacing={2} className='result_container'>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Grid container spacing={2}>
                        {savedData && savedData.map((movie: any, index: number) => (
                            <Grid item xs={6} sm={6} md={2} lg={2} xl={2} key={index}>
                                <FadeIn transitionDuration={700} key={index}>
                                    <div key={index} className='movie_img zoom' onClick={() => movieChange(movie)}>
                                        <img className='image_fill' alt={movie.title} src={movie.img}/>
                                    </div>
                                </FadeIn>
                            </Grid>
                        ))}
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </FadeIn>
        )}
    </div>
  );
};

export default withAuthInfo(Profile);