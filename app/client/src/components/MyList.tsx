import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from './FadeIn';
import '../assets/styles/MyList.scss';
import Grid from '@mui/material/Grid';
import FavoriteIcon from '@mui/icons-material/Favorite';

const MyList = () => {
    const [userData, setUserData] = useState<any>(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [favoriteIds, setFavoriteIds] = useState<any>([]);
    const [favoritesData, setFavoritesData] = useState<any>(null);

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
                console.log(data)
                setFavoritesData(data);
                setIsLoading(false);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [favoriteIds]);

  return (
    <div className="mylist_root">
    {userData && !isLoading && (
        <FadeIn transitionDuration={700}>
            <h1>My Favorites <FavoriteIcon/></h1>
            <Grid container spacing={2} className='result_container'>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Grid container spacing={2}>
                    {favoritesData && favoritesData.map((movie: any, index: number) => (
                        <Grid item xs={6} sm={6} md={2} lg={2} xl={2} key={index}>
                            <FadeIn transitionDuration={700} key={index}>
                                <div key={index} className='movie_img zoom'>
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
    </div>
  );
};

export default MyList;