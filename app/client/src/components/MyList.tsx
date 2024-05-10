import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from './FadeIn';
import MovieCard from './MovieCard';
import '../assets/styles/MyList.scss';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Favorite from '@mui/icons-material/Favorite';
import Grid from '@mui/material/Grid';

const MyList = () => {
    const [userData, setUserData] = useState<any>(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [favoriteIds, setFavoriteIds] = useState<any>([]);
    const [favoritesData, setFavoritesData] = useState<any>(null);

    const [savedIds, setSavedIds] = useState<any>([]);
    const [savedData, setSavedData] = useState<any>(null);

    const [movieDetail, setMovieDetail] = useState<any>(null);
    const [clicked, setClicked] = useState<boolean>(false);

    const handleClickedChange = () => {
		setClicked(false)
	};
		
	const handleClick = (movie: any) => {
		setMovieDetail(movie);
		setClicked(true);
	};

    const handleMovieChange = (data: any) => {
		setMovieDetail(data);
		// setClicked(true);
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};

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
            const response = await fetch("/user", {
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

    useEffect(() => {
        const fetchData = async () => {
            if (!userData) return;

            try {
                const response = await fetch("/query_favorites", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "username": userData[0]
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
    }, [userData]);

    useEffect(() => {
        setIsLoading(true);
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
                setIsLoading(false);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [favoriteIds]);

    useEffect(() => {
        const fetchData = async () => {
            if (!userData) return;

            try {
                const response = await fetch("/query_bookmarks", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "username": userData[0]
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
    }, [userData]);

    useEffect(() => {
        setIsLoading(true);
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
                setIsLoading(false);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [savedIds]);

  return (
    <div className="mylist_root">
    {userData && !isLoading && !clicked && (
        <FadeIn transitionDuration={700}>
            <div className="mylist_header">
                <h1>My Favorites</h1>
                <Favorite/>
            </div>
            {favoritesData && favoritesData.length === 0 && (
                <p>Your favorite list is empty!</p>
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

            <div className="mylist_header">
                <h1>Watch Later</h1>
                <BookmarkIcon/>
            </div>
            {savedData && savedData.length === 0 && (
                <p>Your saved list is empty!</p>
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
        </FadeIn>
    )}

        <React.StrictMode>
            <MovieCard
            parentToChild={{ movieDetail, isLoading, clicked }}
            movieChange={handleMovieChange}
            clickedChange={handleClickedChange}
            />
        </React.StrictMode>
    </div>
  );
};

export default MyList;