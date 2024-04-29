import React, { useEffect, useState } from 'react';
import FadeIn from './FadeIn';
import { styled } from '@mui/material/styles';

// Import MUI components
// import Divider from '@mui/material/Divider';
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
  1: {
    icon: <SentimentVeryDissatisfiedIcon color="error" />,
    label: 'Very Sad',
  },
  2: {
    icon: <SentimentDissatisfiedIcon color="warning" />,
    label: 'Sad',
  },
  3: {
    icon: <SentimentSatisfiedIcon color="primary" />,
    label: 'Neutral',
  },
  4: {
    icon: <SentimentSatisfiedAltIcon color="success" />,
    label: 'Happy',
  },
  5: {
    icon: <SentimentVerySatisfiedIcon color="success" />,
    label: 'Very Happy',
  },
};

function IconContainer(props: IconContainerProps) {
  const { value, ...other } = props;
  return <span {...other}>{customIcons[value].icon}</span>;
}

function MovieCard({ parentToChild, movieChange, clickedChange }: any) {

    const {movieDetail, isFilterLoading, clicked} = parentToChild;

    const [similarMoviesData, setSimilarMoviesData] = useState<any>(null);
    const [castsData, setCastsData] = useState<any>(null);
    const [newsData, setNewsData] = useState<any>(null);
    // const [trailerData, setTrailerData] = useState<any>(null);
    // const [trailerError, setTrailerError] = useState<boolean>(false);

    const [isSimilarLoading, setIsSimilarLoading] = useState<boolean>(false);
    const [isCastsLoading, setIsCastsLoading] = useState<boolean>(false);
    const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false);

    const Item = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(1),
        textAlign: 'left',
    }));

    const StyledRating = styled(Rating)({  
        '& .MuiRating-iconFilled': {
          color: '#ff6d75',
        },
    });

    useEffect(() => {
        setIsCastsLoading(true);
        const fetchData = async () => {
            try {
                const response = await fetch(`/generate_casts?title=${movieDetail.title}(${movieDetail.year})`);
                if (response.ok) {
                    const data = await response.json();
                    setCastsData(await data);
                    setIsCastsLoading(false);
                } else {
                    console.error('Error fetching movie casts data');
                    setIsCastsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching movie casts data:', error);
                setIsCastsLoading(false);
            }
        };

        if (movieDetail !== null) {
            fetchData();
        }
    }, [movieDetail]);

    useEffect(() => {
        setIsNewsLoading(true);
        const fetchData = async () => {
            try {
                const response = await fetch(`/generate_news?title=${movieDetail.title}(${movieDetail.year})`);
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
                                    <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite className='heart_icon'/>} />
                                    <Checkbox icon={<BookmarkBorderIcon />} checkedIcon={<BookmarkIcon className='save_icon' />} />
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
                                    <p className='sub_section'>{movieDetail.genre}</p>
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
                                        value={movieDetail.sentiment}
                                        IconContainerComponent={IconContainer}
                                        getLabelText={(value: number) => customIcons[value].label}
                                        highlightSelectedOnly
                                        readOnly
                                        />
                                        <p>{movieDetail.sentiment}/5 ({movieDetail.sentiment === 1 ? 'Very Sad' : movieDetail.sentiment === 2 ? 'Sad' : movieDetail.sentiment === 3 ? 'Neutral' : movieDetail.sentiment === 4 ? 'Happy' : 'Very Happy'})</p>
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

                                {!isCastsLoading ? (
                                    castsData && castsData.director !== 'Unknown' && castsData.director !== '' && (
                                        <div className='padding-bottom'>
                                        <h3>Top Crew</h3>
                                        <p>Director: {castsData.director}</p>
                                        <p>Writer: {castsData.writer}</p>
                                        <p>Main Casts: {castsData.main_cast_1 !== '' && castsData.main_cast_1} | {castsData.main_cast_2 !== '' && castsData.main_cast_2} | {castsData.main_cast_3 !== '' && castsData.main_cast_3}</p>
                                        </div>
                                    )
                                ) : (
                                    <Skeleton variant="rounded" width="100%" height={150} style={{marginBottom: '15px', backgroundColor: 'rgb(124 124 124)'}} />
                                )}

                                {!isNewsLoading ? (
                                    newsData && newsData.headline_1 !== '' && (
                                        <div className='movie_news padding-bottom'>
                                        <h3>Related News</h3>
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