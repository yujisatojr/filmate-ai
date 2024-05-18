import React, { useEffect, useState } from 'react';
import FadeIn from './FadeIn';
import {withAuthInfo} from '@propelauth/react';
import { styled } from '@mui/material/styles';
import '../assets/styles/MovieCard.scss';
import apple from '../assets/images/apple.png';
import disney from '../assets/images/disney.png';
import hulu from '../assets/images/hulu.png';
import max from '../assets/images/max.png';
import mgm from '../assets/images/mgm.png';
import netflix from '../assets/images/netflix.png';
import paramount from '../assets/images/paramount.png';
import prime from '../assets/images/prime.png';

// Import MUI components
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import { RadialGauge, RadialGaugeArc, StackedRadialGaugeSeries, StackedRadialGaugeValueLabel, StackedRadialGaugeDescriptionLabel } from 'reaviz';

// Import icons
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';

function MovieCard({ parentToChild, movieChange, clickedChange, isLoggedIn, user }: any) {
    
    const {movieDetail, isFilterLoading, clicked} = parentToChild;
    const [similarMoviesData, setSimilarMoviesData] = useState<any>(null);
    const [newsData, setNewsData] = useState<any>(null);
    // const [trailerData, setTrailerData] = useState<any>(null);
    // const [trailerError, setTrailerError] = useState<boolean>(false);

    const [isSimilarLoading, setIsSimilarLoading] = useState<boolean>(true);
    const [isNewsLoading, setIsNewsLoading] = useState<boolean>(true);

    const [userData, setUserData] = useState<any>(null);
    const [isMovieLiked, setIsMovieLiked] = useState<any>(null);
    const [movieChanged, setMovieChanged] = useState<any>(null);
    const [movieSaved, setMovieSaved] = useState<any>(null);
    const [isMovieSaved, setIsMovieSaved] = useState<any>(null);

    const [isNetworksLoading, setNetworksLoading] = useState<boolean>(true);
    const [networksData, setNetworksData] = useState<any>(null);

    const Item = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(1),
        textAlign: 'left',
    }));

    useEffect(() => {
        let controller = new AbortController();
        let signal = controller.signal;

        setIsNewsLoading(true);
        const fetchData = async () => {
            try {
                const response = await fetch(`/generate_facts?title=${movieDetail.title}(${movieDetail.year})`, {signal});
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

        return () => {
            controller.abort();
            controller = new AbortController();
        }
    }, [movieDetail]);
    
    useEffect(() => {
        let controller = new AbortController();
        let signal = controller.signal;

        setIsSimilarLoading(true);
        const fetchData = async () => {
            try {
                const response = await fetch(`/similarity_search?metadata=${movieDetail.metadata}`, {signal});
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

        return () => {
            controller.abort();
            controller = new AbortController();
        }
    }, [movieDetail]);

    useEffect(() => {
        if (isLoggedIn) {
            setUserData(user);
        }
    }, [isLoggedIn, user]);

    const appendMovie = async (film_id: number) => {
        try {
            const response = await fetch("/favorites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "film_id": film_id,
                    "user_id": userData['userId']
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
                    "user_id": userData['userId']
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
        let controller = new AbortController();
        let signal = controller.signal;
        
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
                    signal,
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "film_id": movieDetail.id,
                        "user_id": userData['userId']
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
        return () => {
            controller.abort();
            controller = new AbortController();
        }
    }, [userData, movieDetail, movieChanged]);

    useEffect(() => {
        let controller = new AbortController();
        let signal = controller.signal;

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
                    signal,
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "film_id": movieDetail.id,
                        "user_id": userData['userId']
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
        return () => {
            controller.abort();
            controller = new AbortController();
        }
    }, [userData, movieDetail, movieSaved]);

    useEffect(() => {
        let controller = new AbortController();
        let signal = controller.signal;

        setNetworksLoading(true);
        const fetchData = async () => {
            try {
                const response = await fetch(`/networks?movie_id=${movieDetail.id}`, {signal});
            if (response.ok) {
                const data = await response.json();
                setNetworksData(await data);
                setNetworksLoading(false);
            } else {
                console.error('Error fetching movie data');
                setNetworksLoading(false);
            }
            } catch (error) {
                console.error('Error fetching movie data:', error);
                setNetworksLoading(false);
            }
        };

        if (movieDetail !== null) {
            fetchData();
        }

        return () => {
            controller.abort();
            controller = new AbortController();
        }
    }, [movieDetail]);

    return (
        <>
        {!isFilterLoading && clicked && (
		<FadeIn transitionDuration={700}>
			<Grid container spacing={2} className='result_container'>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Item className='movie_detail_card'>
                        <div className='mobile_close_btn'>
                            <CloseIcon fontSize="inherit" onClick={() => clickedChange(false)}/>
                        </div>
                        <Grid container spacing={2}>
                            <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
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
                            <Grid className='mobile_grid_area right_area' item xs={8} sm={8} md={4} lg={4} xl={4}>
                                <div className='right_header'>
                                    <h1>{movieDetail && movieDetail.title}</h1>
                                </div>
                                
                                <div className='header_flex'>
                                    <div className='genres_section'>
                                        {movieDetail && movieDetail.genres.map((genre: any, index: number) => (
                                            <Chip key={index} label={`${genre}`} variant="outlined" className='genre_chip' />
                                        ))}
                                    </div>

                                    <div className='detail_section'>
                                        <p className='sub_section'>{movieDetail.year}</p>
                                        <p className='sub_section'>{movieDetail.runtime}</p>
                                        <p>{movieDetail.certificate}</p>
                                    </div>
                                </div>
                                
                                <p className='summary_section'>{movieDetail.summary}</p>
                            </Grid>
                            <Grid className='right_area' item xs={12} sm={12} md={8} lg={8} xl={8}>
                                <div className='desktop_area'>
                                    <div className='right_header'>
                                        <h1>{movieDetail && movieDetail.title}</h1>
                                        <div className='header_close_button'>
                                            <CloseIcon fontSize="inherit" onClick={() => clickedChange(false)}/>
                                        </div>
                                    </div>
                                    
                                    <div className='header_flex'>
                                        <div className='genres_section'>
                                            {movieDetail && movieDetail.genres.map((genre: any, index: number) => (
                                                <Chip key={index} label={`${genre}`} variant="outlined" className='genre_chip' />
                                            ))}
                                        </div>

                                        <div className='detail_section'>
                                            <p className='sub_section'>{movieDetail.year}</p>
                                            <p className='sub_section'>{movieDetail.runtime}</p>
                                            <p>{movieDetail.certificate}</p>
                                        </div>
                                    </div>
                                    
                                    <p className='summary_section'>{movieDetail.summary}</p>
                                </div>

                                {/* <div className='rating_section sub_section'>
                                    <h3>Rating</h3>
                                    <Rating name="rating_star" value={movieDetail.rating} precision={0.1} max={10} readOnly />
                                    <p>{movieDetail.rating}/10 ({movieDetail.votes} votes)</p>
                                </div> */}

                                <div className='card_content'>
                                    <h3>Sentiment Score</h3>
                                    <div className='flex_section'>
                                        <div className='gauge_chart_wrapper'>
                                            <RadialGauge
                                            data={[{
                                            key: 'Sentiment',
                                            data: movieDetail ? movieDetail.sentiment_score : 0
                                            }]}
                                            height={120} 
                                            width={120} 
                                            minValue={-1}
                                            maxValue={10}
                                            series={
                                                <StackedRadialGaugeSeries
                                                outerArc={
                                                    <RadialGaugeArc 
                                                    disabled={true}
                                                    animated={false}
                                                    />
                                                }
                                                label={
                                                    <StackedRadialGaugeValueLabel
                                                    label={movieDetail ? `${movieDetail.sentiment_score}` : '0'}
                                                    className="gauge_chart_center"
                                                    // yOffset={5}
                                                    />
                                                }
                                                innerArc={
                                                    <RadialGaugeArc cornerRadius={12.5} />
                                                } 
                                                colorScheme={
                                                    movieDetail && (movieDetail.sentiment_score === 0 || movieDetail.sentiment_score === 1) ? ['#d32f2f'] 
                                                    : movieDetail && (movieDetail.sentiment_score === 2 || movieDetail.sentiment_score === 3) ? ['#f57c00'] 
                                                    : movieDetail && (movieDetail.sentiment_score === 4 || movieDetail.sentiment_score === 5 || movieDetail.sentiment_score === 6) ? ['#ab47bc'] 
                                                    : movieDetail && (movieDetail.sentiment_score === 7 || movieDetail.sentiment_score === 8) ? ['#0288d1'] 
                                                    : movieDetail && (movieDetail.sentiment_score === 9 || movieDetail.sentiment_score === 10) ? ['#388e3c'] 
                                                    : ['gray']
                                                }
                                                descriptionLabel={
                                                    <StackedRadialGaugeDescriptionLabel
                                                    label='/10'
                                                    yOffset={-5}
                                                    className='gauge_chart_desc'
                                                    />
                                                }
                                                />
                                            }
                                            />
                                        </div>

                                        <div className='sentiment_reason'>
                                            <p className='sentiment_header'>
                                                {
                                                movieDetail && (movieDetail.sentiment_score === 0) ? 'Depressing Movie' 
                                                : movieDetail && (movieDetail.sentiment_score === 1) ? 'Very Sad Movie'
                                                : movieDetail && (movieDetail.sentiment_score === 2) ? 'Sad Movie'
                                                : movieDetail && (movieDetail.sentiment_score === 3) ? 'Somewhat Sad Movie'
                                                : movieDetail && (movieDetail.sentiment_score === 4) ? 'Neutral, Occasional Sad Moments'
                                                : movieDetail && (movieDetail.sentiment_score === 5) ? 'Neutral Movie'
                                                : movieDetail && (movieDetail.sentiment_score === 6) ? 'Neutral, Occasional Happy Moments'
                                                : movieDetail && (movieDetail.sentiment_score === 7) ? 'Somewhat Happy Movie'
                                                : movieDetail && (movieDetail.sentiment_score === 8) ? 'Happy Movie'
                                                : movieDetail && (movieDetail.sentiment_score === 9) ? 'Very Happy Movie'
                                                : movieDetail && (movieDetail.sentiment_score === 10) ? 'Joyful Movie'
                                                : 'No Data Available'
                                                }
                                            </p>
                                        <p>{movieDetail.sentiment_reason}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* <ThemeProvider theme={darkTheme}>
                                    <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'background.default',
                                        display: 'grid',
                                        gridTemplateColumns: { md: '1fr 1fr' },
                                        gap: 2,
                                    }}
                                    >
                                    <CardItem key={8} elevation={8}>
                                    {`elevation=${8}`}
                                    </CardItem>
                                    </Box>
                                </ThemeProvider> */}
                                <div className='padding-bottom'>
                                    <h3>Who is this movie for?</h3>
                                    <p>{movieDetail && movieDetail.recommended_audience}</p>
                                </div>

                                {!isNetworksLoading ? (
                                    networksData && networksData.length > 0 ? (
                                        <div className='padding-bottom'>
                                            <h3>Where can I watch this?</h3>
                                            <div className='networks_container'>
                                            {networksData.map((network: any, index: number) => (
                                                <React.Fragment key={index}>
                                                    {network.name === 'Netflix' && (
                                                        <a href={network.url} target="_blank" rel="noopener noreferrer">
                                                            <img className='network_img' src={netflix} alt='netflix'/>
                                                        </a>
                                                    )}
                                                    {network.name === 'Prime Video' && (
                                                        <a href={network.url} target="_blank" rel="noopener noreferrer">
                                                            <img className='network_img' src={prime} alt='prime'/>
                                                        </a>
                                                    )}
                                                    {network.name === 'Paramount Plus' && (
                                                        <a href={network.url} target="_blank" rel="noopener noreferrer">
                                                            <img className='network_img' src={paramount} alt='paramount'/>
                                                        </a>
                                                    )}
                                                    {network.name === 'Disney+' && (
                                                        <a href={network.url} target="_blank" rel="noopener noreferrer">
                                                            <img className='network_img' src={disney} alt='disney'/>
                                                        </a>
                                                    )}
                                                    {network.name === 'MAX' && (
                                                        <a href={network.url} target="_blank" rel="noopener noreferrer">
                                                            <img className='network_img' src={max} alt='max'/>
                                                        </a>
                                                    )}
                                                    {(network.name === 'Hulu') && (
                                                        <a href={network.url} target="_blank" rel="noopener noreferrer">
                                                            <img className='network_img' src={hulu} alt='hulu'/>
                                                        </a>
                                                    )}
                                                    {network.name === 'AppleTV+' && (
                                                        <a href={network.url} target="_blank" rel="noopener noreferrer">
                                                            <img className='network_img' src={apple} alt='apple'/>
                                                        </a>
                                                    )}
                                                    {network.name === 'MGM+' && (
                                                        <a href={network.url} target="_blank" rel="noopener noreferrer">
                                                            <img className='network_img' src={mgm} alt='mgm'/>
                                                        </a>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='padding-bottom'>
                                            <h3>Where can I watch this?</h3>
                                            <p>This title is not currently streaming on any providers.</p>
                                        </div>
                                    )
                                ) : (
                                    <Skeleton variant="rounded" width="100%" height={150} style={{marginBottom: '15px', backgroundColor: 'rgb(124, 124, 124)'}} />
                                )}

                                <div className='padding-bottom'>
                                    <h3>Top Crew</h3>
                                    <p>Director:
                                        {movieDetail && movieDetail.directors.map((director: any, index: number, directorsArray: any[]) => (
                                        <>
                                            <a href='/' key={director}>{' ' + director}</a>
                                            {index === directorsArray.length - 1 ? '' : ' | '}
                                        </>
                                        ))}
                                    </p>
                                    <p>Writer:
                                        {movieDetail && movieDetail.writers.map((writer: any, index: number, writersArray: any[]) => (
                                        <>
                                            <a href='/' key={writer}>{' ' + writer}</a>
                                            {index === writersArray.length - 1 ? '' : ' | '}
                                        </>
                                        ))}
                                    </p>
                                    <p>Top Casts:
                                        {movieDetail && movieDetail.casts.map((cast: any, index: number, castsArray: any[]) => (
                                        <>
                                            <a href='/' key={cast}>{' ' + cast}</a>
                                            {index === castsArray.length - 1 ? '' : ' | '}
                                        </>
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

export default withAuthInfo(MovieCard);