import React, { useEffect, useState } from 'react';
import FadeIn from './FadeIn';
import {withAuthInfo} from '@propelauth/react';
import { styled } from '@mui/material/styles';
import '../assets/styles/MovieCard.scss';

// Import network logos
import apple from '../assets/images/apple.png';
import disney from '../assets/images/disney.png';
import hulu from '../assets/images/hulu.png';
import max from '../assets/images/max.png';
import mgm from '../assets/images/mgm.png';
import netflix from '../assets/images/netflix.png';
import paramount from '../assets/images/paramount.png';
import prime from '../assets/images/prime.png';

// Import MUI components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import { RadialGauge, RadialGaugeArc, StackedRadialGaugeSeries, StackedRadialGaugeValueLabel, StackedRadialGaugeDescriptionLabel } from 'reaviz';

// Import icons
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';

function MovieCard({ parentToChild, movieChange, clickedChange, isLoggedIn, user }: any) {
    
    const {movieDetail, isFilterLoading, clickedDetail} = parentToChild;
    const [similarMoviesData, setSimilarMoviesData] = useState<any>(null);
    const [newsData, setNewsData] = useState<any>(null);

    const [isSimilarLoading, setIsSimilarLoading] = useState<boolean>(true);
    const [isNewsLoading, setIsNewsLoading] = useState<boolean>(true);

    const [userData, setUserData] = useState<any>(null);
    const [isMovieLiked, setIsMovieLiked] = useState<any>(null);
    const [movieChanged, setMovieChanged] = useState<any>(null);
    const [movieSaved, setMovieSaved] = useState<any>(null);
    const [isMovieSaved, setIsMovieSaved] = useState<any>(null);

    const [isNetworksLoading, setNetworksLoading] = useState<boolean>(true);
    const [networksData, setNetworksData] = useState<any>(null);

    const [modalOpen, setModalOpen] = React.useState(false);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [rating, setRating] = React.useState<number | null>(0);
    const [commentInput, setCommentInput] = useState<string>('');

    const [existingRating, setExistingRating] = React.useState<number | null>(0);
    const [existingComment, setExistingComment] = useState<string>('');

    const [isReviewChanged, setIsReviewChanged] = useState<boolean>(false);
    const [isReviewExists, setIsReviewExists] = useState<boolean>(false);
    const [reviewData, setReviewData] = useState<any>(null);

    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);

    const handleEditOpen = () => setEditModalOpen(true);
    const handleEditClose = () => setEditModalOpen(false);

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4
    };

    const submitCheckIn = async () => {
        try {
            const response = await fetch("/review", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "film_id": movieDetail.id,
                    "user_id": user['userId'],
                    "rating": rating,
                    "comment": commentInput
                })
            });
            if (response.ok) {
                setIsReviewChanged(prev => !prev);
                setRating(0);
                setCommentInput('');
            } else {
                throw new Error("Failed to post a review");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const updateCheckIn = async () => {
        try {
            const response = await fetch("/review", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "film_id": movieDetail.id,
                    "user_id": user['userId'],
                    "rating": existingRating,
                    "comment": existingComment
                })
            });
            if (response.ok) {
                setIsReviewChanged(prev => !prev);
                setExistingRating(0);
                setExistingComment('');
            } else {
                throw new Error("Failed to post a review");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deleteCheckIn = async () => {
        try {
            const response = await fetch("/review", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "film_id": movieDetail.id,
                    "user_id": user['userId'],
                })
            });
            if (response.ok) {
                setIsReviewChanged(prev => !prev);
                setExistingRating(0);
                setExistingComment('');
            } else {
                throw new Error("Failed to post a review");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        setIsReviewExists(false);
        const getReviewStatus = async () => {
            try {
                const response = await fetch("/get_review", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "film_id": movieDetail.id,
                        "user_id": user['userId'],
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.message === 'exists') {
                        setIsReviewExists(true);
                        setReviewData(data.review);
                    } else if (data.message === 'exists') {
                        setIsReviewExists(false);
                    }
                } else {
                    throw new Error("Failed to fetch review status");
                }
            } catch (error) {
                console.log(error);
            }
        }

        if (movieDetail && movieDetail.id) {
            getReviewStatus();
        }
    }, [movieDetail, isReviewChanged])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCommentInput(e.target.value);
	};

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setExistingComment(e.target.value);
	};

    const checkInToMovie = () => {
        handleOpen();
    }

    const editCheckIn = async() => {
        setExistingRating(reviewData.rating)
        setExistingComment(reviewData.comment)
        handleEditOpen();
    }

    useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}, [clickedDetail]);

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
        {!isFilterLoading && clickedDetail && (
		<FadeIn transitionDuration={700}>
			<Grid container spacing={2} className='result_container'>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Item className='movie_detail_card'>
                        <div className='mobile_close_btn'>
                            <CloseIcon fontSize="inherit" onClick={() => clickedChange(false)}/>
                        </div>
                        <Grid container spacing={2}>
                            <Grid item xs={3.5} sm={3.5} md={3.5} lg={3.5} xl={3.5}>
                                <img className='image_fill' alt={movieDetail.title} src={movieDetail.img}/>
                                {(isLoggedIn && isReviewExists) && (
                                    <Button className='watched_btn checkin_detail_btn' variant="contained" startIcon={<EditIcon />} onClick={() => {editCheckIn()}}>
                                        EDIT REVIEW
                                    </Button>
                                )}
                                {(isLoggedIn && !isReviewExists) && (
                                    <Button className='watched_btn checkin_detail_btn' variant="contained" startIcon={<FileDownloadDoneIcon />} onClick={() => {checkInToMovie()}}>
                                        CHECK IN
                                    </Button>
                                )}
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
                            <Grid className='mobile_grid_area right_area' item xs={8} sm={8} md={8} lg={8} xl={3.5}>
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

                                {(isLoggedIn && isReviewExists) && (
                                    <Button className='watched_btn mobile_checkin_detail_btn' variant="contained" startIcon={<EditIcon />} onClick={() => {editCheckIn()}}>
                                        EDIT REVIEW
                                    </Button>
                                )}
                                {(isLoggedIn && !isReviewExists) && (
                                    <Button className='watched_btn mobile_checkin_detail_btn' variant="contained" startIcon={<FileDownloadDoneIcon />} onClick={() => {checkInToMovie()}}>
                                        CHECK IN
                                    </Button>
                                )}
                            </Grid>
                            <Grid className='right_area' item xs={12} sm={12} md={12} lg={8.5} xl={8.5}>
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
                                            <span key={director}>{' ' + director}</span>
                                            {index === directorsArray.length - 1 ? '' : ' | '}
                                        </>
                                        ))}
                                    </p>
                                    <p>Writer:
                                        {movieDetail && movieDetail.writers.map((writer: any, index: number, writersArray: any[]) => (
                                        <>
                                            <span key={writer}>{' ' + writer}</span>
                                            {index === writersArray.length - 1 ? '' : ' | '}
                                        </>
                                        ))}
                                    </p>
                                    <p>Top Casts:
                                        {movieDetail && movieDetail.casts.map((cast: any, index: number, castsArray: any[]) => (
                                        <>
                                            <span key={cast}>{' ' + cast}</span>
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
                                        <Grid item xs={6} sm={2.4} md={2.4} lg={2.4} xl={2.4} key={index}>
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

        <Modal
            open={modalOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className='checkin_movie_modal' sx={style}>
                <div className='checkin_forms'>
                    <h1>Check In</h1>
                    <Rating
                        name="simple-controlled"
                        value={rating}
                        onChange={(event, newValue) => {
                        setRating(newValue);
                        }}
                    />
                    <TextField
                        id="outlined-multiline-static"
                        label="Leave a review (optional)"
                        multiline
                        rows={7}
                        defaultValue="Write your comment here"
                        value={commentInput}
                        onChange={handleInputChange}
                    />
                </div>
                <Button className='watched_btn' variant="contained" onClick={() => {submitCheckIn(); handleClose();}}>
                    SUBMIT
                </Button>
            </Box>
        </Modal>

        <Modal
            open={editModalOpen}
            onClose={handleEditClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className='checkin_movie_modal' sx={style}>
                <div className='checkin_forms'>
                    <div className='edit_review_header'>
                        <h1>Edit Review</h1>
                        <IconButton className='review_delete_icon' sx={{ p: 0 }} onClick={() => {deleteCheckIn(); handleEditClose();}}>
                            <DeleteIcon/>
                            <span className='delete_btn'>Delete</span>
                        </IconButton>
                    </div>
                    <Rating
                        name="simple-controlled"
                        value={existingRating}
                        onChange={(event, newValue) => {
                        setExistingRating(newValue);
                        }}
                    />
                    <TextField
                        id="outlined-multiline-static"
                        label="Leave a review (optional)"
                        multiline
                        rows={7}
                        value={existingComment}
                        onChange={handleEditInputChange}
                    />
                </div>
                <Button className='watched_btn' variant="contained" onClick={() => {updateCheckIn(); handleEditClose();}}>
                    Update
                </Button>
            </Box>
        </Modal>
        </>
    );
};

export default withAuthInfo(MovieCard);