import { useEffect, useState } from 'react';
import axios from 'axios';
import FadeIn from 'react-fade-in';
import { Oval, ThreeDots } from 'react-loader-spinner'
import { TypeAnimation } from 'react-type-animation';
import { styled } from '@mui/material/styles';
import './App.scss';

// Import MUI components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';

// Import icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';

function App() {
  const [searchInput, setSearchInput] = useState<string>('');
  const [filterData, setFilterData] = useState<any>(null);
  const [movieData, setMovieData] = useState<any>(null);
  const [movieDetail, setMovieDetail] = useState<any>(null);
  // const [segment, setSegments] = useState<any>([]);

  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false);
  const [initRequest, setInitRequest] = useState<boolean>(false);

  const Item = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1),
    textAlign: 'left',
  }));

  // const truncateString = (str: string, maxLength: number) => str.length > maxLength ? str.slice(0, maxLength) : str;

  // const parseString = (str: string) => {
  //   const segmentsArray = str.split('　');
  //   // setSegments(segmentsArray);
  //   return segmentsArray
  // };

  const handleSearchSubmit = async () => {
    setClicked(false);
    setIsFilterLoading(true);
    try {
      const response = await fetch(`/generate_filters?user_query=${searchInput}`);
      if (response.ok) {
        const data = await response.json();
        setFilterData(await data);
        setIsFilterLoading(false);
      } else {
        console.error('Error fetching movie data');
        setIsFilterLoading(false);
      }
    } catch (error) {
      console.error('Error fetching movie data:', error);
      setIsFilterLoading(false);
    }
  };

  const handleClick = (movie: any) => {
    setMovieDetail(movie);
    setClicked(true);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('/search_movies', filterData);
        setMovieData(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (filterData !== null) {
      fetchData();
    }

    return () => {
      // Cancel any ongoing requests here if needed
    };
  }, [filterData]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scrolling animation
    });
  }, [clicked]);

  useEffect(() => {
    handleSearchSubmit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(filterData);
  // console.log(movieData);

  return (
  <>
    <div className='movie_app_root'>
      <FadeIn transitionDuration={700}>
        <div className='header'>
          <h1>Smart Movie Search 🍿</h1>
          <Button className='button-desktop' variant="contained" endIcon={<HelpIcon />} onClick={() => {
                setOpen(true);
              }}>
            HELP
          </Button>
        </div>
        <Collapse in={open}>
          <Alert
          className='alert_container'
          severity="info"
          icon={<HelpIcon fontSize="inherit" />}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
          >
            <span className='instruction'>This movie search app uses GenAI to handle natural language queries beyond the traditional keyword search. The app also provides recommendations on movie titles and directors based on the input sentences. Try out the following three search patterns:</span>
            <ol>
              <li>Semantic search based on context and concepts: For example, using the word "Ocean" will yield hits related to summer, ships, and blue, etc.</li>
              <li>Sentiment analysis based on emotion: For example, "happy movie" and "sad movie" will sort movies based on their content mood.</li>
              <li>Filter search based on words or phrases: It supports flexible searches including movie titles, director names, content, and revenues.</li>
            </ol>
          </Alert>
        </Collapse>

        <div className='search_form_wrapper'>
          <Paper
            className='search_form'
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}
            onSubmit={(e) => {
              e.preventDefault();
              setInitRequest(true);
              handleSearchSubmit();
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder='Enter your sentence'
              inputProps={{ 'aria-label': 'search movies' }}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
        </div>

        {((isFilterLoading || (movieData != null )) && initRequest !== false && (filterData['insights'] !== '')) && (
        <Accordion className='accordion_container'>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
          {isFilterLoading ? (
            <span className='accordion_label'>
              <Oval
                visible={true}
                height="20"
                width="20"
                color="black"
                secondaryColor="gray"
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass=""
                strokeWidth={5}
              />
              Generating an insight and recommends based on your query...
            </span>
          ) : (
            <span className='accordion_label'>
              <CheckCircleIcon/> 
              Finished generating insights! (Click to view)
            </span>
          )}
          </AccordionSummary>
          <AccordionDetails>
            {(!isFilterLoading && filterData) ? (
            <Alert
            className='alert_container filter_list'
            severity="info"
            sx={{ mb: 2 }}
            >
              <TypeAnimation
                sequence={[
                  `${filterData['sentiment'] === 'positive' ? 'The search results have been tailored to include only movies that align with the positive emotions based on your input.\n' : ''}
                  ${filterData['sentiment'] === 'negative' ? 'The search results have been tailored to include only movies that align with the negative emotions based on your input.\n': ''}
                  ${filterData['insights'] !== '' ? filterData['insights'] : ''}`,
                ]}
                speed={{ type: 'keyStrokeDelayInMs', value: 30 }}
                style={{ fontSize: '1em', display: 'block'}}
                cursor={false}
              />
            </Alert>
            ) : (<span>Loading...</span>)}
          </AccordionDetails>
        </Accordion>
        )}

        {isFilterLoading && (
        <FadeIn transitionDuration={500}>
          <div className='loading'>
            <ThreeDots
            visible={true}
            height="60"
            width="60"
            color="black"
            radius="9"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
            />
          </div>
        </FadeIn>
        )}

        {!isFilterLoading && !clicked && (
        <FadeIn transitionDuration={700}>
          <Grid container spacing={2} className='result_container'>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Grid container spacing={2}>
                {movieData && movieData.map((movie: any, index: number) => (
                  <Grid item xs={12} sm={12} md={4} lg={4} xl={4} key={index}>
                    <FadeIn transitionDuration={700} key={index}>
                      <div key={index} className='movie_img zoom' onClick={() => handleClick(movie)}>
                        <img
                        className='image-fill'
                        src={movie.img}
                        alt={movie.title}
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null; // prevents looping
                        }}
                        />
                      </div>
                    </FadeIn>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </FadeIn>
        )}

        {!isFilterLoading && clicked && (
        <FadeIn transitionDuration={700}>
          <Grid container spacing={2} className='result_container'>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Item className='movie_detail_card'>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                    <img
                    className='image_fill'
                    src={movieDetail.img}
                    alt={movieDetail.title}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                    }}
                    />
                  </Grid>
                  <Grid className='right_area' item xs={12} sm={12} md={8} lg={8} xl={8}>
                    <div className='right_header'><h1>{movieDetail.title}</h1><CloseIcon fontSize="inherit" onClick={() => setClicked(false)}/></div>
                    <p>{movieDetail.summary}</p>
                    <p>{movieDetail.year}</p>
                    <p>{movieDetail.genre}</p>
                    <p>{movieDetail.certificate}</p>
                    <p>{movieDetail.runtime}</p>
                    <p>{movieDetail.rating} ({movieDetail.votes})</p>
                    <p>{movieDetail.sentiment}</p>
                  </Grid>
                </Grid>
              </Item>
            </Grid>
          </Grid>
        </FadeIn>
        )}
      </FadeIn>
    </div>
    <p className='footer'>The app designed & created by Yuji Sato</p>
  </>
  );
}

export default App;