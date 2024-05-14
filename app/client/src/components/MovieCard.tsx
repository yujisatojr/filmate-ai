import React, { useEffect, useState } from 'react';
import FadeIn from './FadeIn';
import { styled } from '@mui/material/styles';

// Import MUI components
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Rating, { IconContainerProps } from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';

// Import icons
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const customIcons: {
  [index: string]: {
    icon: React.ReactElement;
    label: string;
  };
} = {
    0: {
        icon: <SentimentVeryDissatisfiedIcon color="error" />,
        label: 'Extremely Sad Movie',
    },
    1: {
        icon: <SentimentVeryDissatisfiedIcon color="error" />,
        label: 'Very Sad Movie',
    },
    2: {
        icon: <SentimentVeryDissatisfiedIcon color="warning" />,
        label: 'Sad Movie',
    },
    3: {
        icon: <SentimentVeryDissatisfiedIcon color="warning" />,
        label: 'Somewhat Sad Movie',
    },
    4: {
        icon: <SentimentVeryDissatisfiedIcon color="primary" />,
        label: 'Neutral, Slightly Sad Movie',
    },
    5: {
        icon: <SentimentVeryDissatisfiedIcon color="primary" />,
        label: 'Neutral Movie',
    },
    6: {
        icon: <SentimentVeryDissatisfiedIcon color="primary" />,
        label: 'Neutral, Slightly Happy Movie',
    },
    7: {
        icon: <SentimentVeryDissatisfiedIcon color="success" />,
        label: 'Somewhat Happy Movie',
    },
    8: {
        icon: <SentimentVeryDissatisfiedIcon color="success" />,
        label: 'Happy Movie',
    },
    9: {
        icon: <SentimentVeryDissatisfiedIcon color="success" />,
        label: 'Very Happy Movie',
    },
    10: {
        icon: <SentimentVeryDissatisfiedIcon color="success" />,
        label: 'Extremely Happy Movie',
    },
};

function IconContainer(props: IconContainerProps) {
  const { value, ...other } = props;
  return <span {...other}>{customIcons[value].icon}</span>;
}

function MovieCard({ parentToChild, movieChange, clickedChange }: any) {

    const {movieDetail, isFilterLoading, clicked} = parentToChild;

    const [similarMoviesData, setSimilarMoviesData] = useState<any>(null);
    const [newsData, setNewsData] = useState<any>(null);
    // const [trailerData, setTrailerData] = useState<any>(null);
    // const [trailerError, setTrailerError] = useState<boolean>(false);

    const [isSimilarLoading, setIsSimilarLoading] = useState<boolean>(false);
    const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false);

    const [userData, setUserData] = useState<any>(null);
    const [isMovieLiked, setIsMovieLiked] = useState<any>(null);
    const [movieChanged, setMovieChanged] = useState<any>(null);
    const [movieSaved, setMovieSaved] = useState<any>(null);
    const [isMovieSaved, setIsMovieSaved] = useState<any>(null);

    const Item = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(1),
        textAlign: 'left',
    }));

    const StyledRating = styled(Rating)({  
        '& .MuiRating-iconFilled': {
          color: '#ff6d75',
        },
    });

    movieDetail && console.log(movieDetail.sentiment_score)

    useEffect(() => {
        setIsNewsLoading(true);
        const fetchData = async () => {
            try {
                const response = await fetch(`/generate_facts?title=${movieDetail.title}(${movieDetail.year})`);
                if (response.ok) {
                    const data = await response.json();
                    setNewsData(await data);
                    setIsNewsLoading(false);
                } else {
                    console.error('Error fetching movie news data');
                    setIsNewsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching movie news data:', error);
                setIsNewsLoading(false);
            }
        };

        if (movieDetail !== null) {
            fetchData();
        }
    }, [movieDetail]);

    // useEffect(() => {
    //   const fetchData = async () => {
    //     try {
    //       const response = await fetch(`/generate_trailer?title=${movieDetail.title}`);
    //       if (response.ok) {
    //         const data = await response.json();
    //         setTrailerData(await data);
    //       } else {
    //         console.error('Error fetching movie trailer data');
    //       }
    //     } catch (error) {
    //       console.error('Error fetching movie trailer data:', error);
    //     }
    //   };

    //   if (movieDetail !== null) {
    //     fetchData();
    //   }
    // }, [movieDetail]);
    
    useEffect(() => {
        setIsSimilarLoading(true);
        const fetchData = async () => {
            try {
                const response = await fetch(`/similarity_search?metadata=${movieDetail.metadata}`);
            if (response.ok) {
                const data = await response.json();
                setSimilarMoviesData(await data);
                setIsSimilarLoading(false);
            } else {
                console.error('Error fetching movie data');
                setIsSimilarLoading(false);
            }
            } catch (error) {
                console.error('Error fetching movie data:', error);
                setIsSimilarLoading(false);
            }
        };

        if (movieDetail !== null) {
            fetchData();
        }
    }, [movieDetail]);

    useEffect(() => {
        const checkCookies = async () => {
          const authSessionCookie = document.cookie.match("auth-session=([^;]+)");
          // console.log(authSessionCookie)
    
          if (!authSessionCookie) {
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
                // console.log(data);
                setUserData([data.username, data.email]);
            } catch (error) {
                console.log('User is not logged in.');
            }
        };
    
        fetchData();
    }, []);

    const appendMovie = async (film_id: number) => {
        try {
            const response = await fetch("/favorites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "film_id": film_id,
                    "username": userData[0]
                })
            });
    
            if (response.ok) {
                console.log(film_id + ' is added to the database.')
                setMovieChanged(film_id);
            } else {
                throw new Error("Failed to post film data");
            }
        
        } catch (error) {
            console.log(error);
        }
    }

    const removeMovie = async (favorite_id: number) => {
        try {
            const response = await fetch("/favorite", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "favorite_id": favorite_id,
                })
            });
    
            if (response.ok) {
                console.log(favorite_id + ' is deleted from the database.')
                setMovieChanged(favorite_id);
            } else {
                throw new Error("Failed to delete film data");
            }
        
        } catch (error) {
            console.log(error);
        }
    }

    const saveMovie = async (film_id: number) => {
        try {
            const response = await fetch("/bookmarks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "film_id": film_id,
                    "username": userData[0]
                })
            });
    
            if (response.ok) {
                console.log(film_id + ' is saved to the database.')
                setMovieSaved(film_id);
            } else {
                throw new Error("Failed to post film data");
            }
        
        } catch (error) {
            console.log(error);
        }
    }

    const unsaveMovie = async (bookmark_id: number) => {
        try {
            const response = await fetch("/bookmark", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "bookmark_id": bookmark_id,
                })
            });
    
            if (response.ok) {
                console.log(bookmark_id + ' is unsaved from the database.')
                setMovieSaved(bookmark_id);
            } else {
                throw new Error("Failed to delete film data");
            }
        
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const checkIsValid = async () => {
            if (!userData || !movieDetail) {
              return false;
            }
            return true;
        };

        const fetchData = async () => {
            const isValid = await checkIsValid();
            if (!isValid) return;

            try {
                const response = await fetch("/query_favorite", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "film_id": movieDetail.id,
                        "username": userData[0]
                    })
                });

                const data = await response.json();
                // console.log(data)
                setIsMovieLiked(data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [userData, movieDetail, movieChanged]);

    useEffect(() => {
        const checkIsValid = async () => {
            if (!userData || !movieDetail) {
              return false;
            }
            return true;
        };

        const fetchData = async () => {
            const isValid = await checkIsValid();
            if (!isValid) return;

            try {
                const response = await fetch("/query_bookmark", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "film_id": movieDetail.id,
                        "username": userData[0]
                    })
                });

                const data = await response.json();
                // console.log(data)
                setIsMovieSaved(data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [userData, movieDetail, movieSaved]);

    return (
        <>
        {!isFilterLoading && clicked && (
		<FadeIn transitionDuration={700}>
			<Grid container spacing={2} className='result_container'>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Item className='movie_detail_card'>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                                <img className='image_fill' alt={movieDetail.title} src={movieDetail.img}/>
                                <div className='checkbox_elements'>
                                    {userData && isMovieLiked && isMovieLiked.message === "success" && (
                                        <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite className='heart_icon'/>} checked onClick={() => removeMovie(isMovieLiked.favorite.favorite_id)}/>
                                    )}
                                    {userData && isMovieLiked && isMovieLiked.message === "not found" && (
                                        <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite className='heart_icon'/>} onClick={() => appendMovie(movieDetail.id)}/>
                                    )}
                                    {userData && isMovieSaved && isMovieSaved.message === "success" && (
                                        <Checkbox icon={<BookmarkBorderIcon />} checkedIcon={<BookmarkIcon className='save_icon' />} checked onClick={() => unsaveMovie(isMovieSaved.bookmark.bookmark_id)}/>
                                    )}
                                    {userData && isMovieSaved && isMovieSaved.message === "not found" && (
                                        <Checkbox icon={<BookmarkBorderIcon />} checkedIcon={<BookmarkIcon className='save_icon' />} onClick={() => saveMovie(movieDetail.id)}/>
                                    )}
                                </div>
                            </Grid>
                            <Grid className='right_area' item xs={12} sm={12} md={8} lg={8} xl={8}>
                                <div className='right_header'>
                                    <h1>
                                        {movieDetail.title}
                                        <span> ({movieDetail.year})</span>
                                    </h1>
                                    <CloseIcon fontSize="inherit" onClick={() => clickedChange(false)}/>
                                </div>
                                
                                <div className='detail_section'>
                                    <p className='sub_section'>{movieDetail.genre_1}</p>
                                    <p className='sub_section'>{movieDetail.runtime}</p>
                                    <p>{movieDetail.certificate}</p>
                                </div>
                                
                                <p>{movieDetail.summary}</p>

                                <div className='flex_section'>
                                    <div className='sub_section'>
                                        <h3>Rating</h3>
                                        <Rating name="rating_star" value={movieDetail.rating} precision={0.1} max={10} readOnly />
                                        <p>{movieDetail.rating}/10 ({movieDetail.votes} votes)</p>
                                    </div>

                                    <div>
                                        <h3>Sentiment Score</h3>
                                        <StyledRating
                                        name="highlight-selected-only"
                                        value={movieDetail.sentiment_score}
                                        IconContainerComponent={IconContainer}
                                        getLabelText={(value: number) => customIcons[value].label}
                                        highlightSelectedOnly
                                        readOnly
                                        />
                                        <p>{movieDetail.sentiment_score}/10</p>
                                        <p>{movieDetail.sentiment_reason}</p>
                                    </div>
                                </div>

                                {/* {(trailerData && !trailerError) ? (
                                    <ReactPlayer url={trailerData.url} onError={(e) => {
                                    e.preventDefault()
                                    setTrailerError(true)
                                    }}/>
                                ) : (
                                    <ReactPlayer url='https://youtu.be/dQw4w9WgXcQ?si=hJge3e8INVEqXkvK'/>
                                )} */}


                                <div className='padding-bottom'>
                                    <h3>Top Crew</h3>
                                    <p>Directors:
                                        {movieDetail && movieDetail.directors.map((director: any, index: number, directorsArray: any[]) => (
                                            <React.Fragment key={director}>
                                                {' ' + director} {index === directorsArray.length - 1 ? '' : ' | '}
                                            </React.Fragment>
                                        ))}
                                    </p>
                                    <p>Writers:
                                        {movieDetail && movieDetail.writers.map((writer: any, index: number, writersArray: any[]) => (
                                            <React.Fragment key={writer}>
                                                {' ' + writer} {index === writersArray.length - 1 ? '' : ' | '}
                                            </React.Fragment>
                                        ))}
                                    </p>
                                    <p>Top Casts:
                                        {movieDetail && movieDetail.casts.map((cast: any, index: number, castsArray: any[]) => (
                                            <React.Fragment key={cast}>
                                                {' ' + cast} {index === castsArray.length - 1 ? '' : ' | '}
                                            </React.Fragment>
                                        ))}
                                    </p>
                                </div>

                                {!isNewsLoading ? (
                                    newsData && newsData.headline_1 !== '' && (
                                        <div className='movie_news padding-bottom'>
                                        <h3>Interesting Facts</h3>
                                        <p><ArrowRightIcon/> {newsData.headline_1}</p>
                                        <p><ArrowRightIcon/> {newsData.headline_2}</p>
                                        <p><ArrowRightIcon/> {newsData.headline_3}</p>
                                        </div>
                                    )
                                ) : (
                                    <Skeleton variant="rounded" width="100%" height={150} style={{marginBottom: '15px', backgroundColor: 'rgb(124 124 124)'}} />
                                )}

                                {!isSimilarLoading ? (
                                <>
                                    <h3>You may also like:</h3>
                                    <Grid container spacing={2}>
                                        {similarMoviesData && similarMoviesData.map((movie: any, index: number) => (
                                        <Grid item xs={6} sm={6} md={2.4} lg={2.4} xl={2.4} key={index}>
                                            <div key={index} className='movie_img zoom' onClick={() => movieChange(movie)}>
                                                <img
                                                className='image_fill'
                                                alt={movie.title}
                                                src={movie.img}
                                                />
                                            </div>
                                        </Grid>
                                        ))}
                                    </Grid>
                                </>
                                ) : (
                                    <Skeleton variant="rounded" width="100%" height={150} style={{marginBottom: '15px', backgroundColor: 'rgb(124 124 124)'}} />
                                )}
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
			</Grid>
		</FadeIn>
        )}
        </>
    );
};

export default MovieCard;