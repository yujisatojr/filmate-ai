import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.scss';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Alt from './assets/images/no_image.png'
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import InfoIcon from '@mui/icons-material/Info';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { Oval, ThreeDots } from 'react-loader-spinner'
// import { styled } from '@mui/material/styles';
import FadeIn from 'react-fade-in';
import Grid from '@mui/material/Grid';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';

// const Item = styled(Paper)(({ theme }) => ({
//   padding: theme.spacing(1),
//   textAlign: 'left',
// }));

function App() {

  // Define state variables
  const [searchInput, setSearchInput] = useState<string>('');
  const [filterData, setFilterData] = useState<any>(null);
  const [movieData, setMovieData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(true);

  const handleSearchSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/generate_filters?user_query=${searchInput}`);
      if (response.ok) {
        const data = await response.json();
        setFilterData(await data);
        setIsLoading(false);
      } else {
        console.error('Error fetching movie data');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching movie data:', error);
      setIsLoading(false);
    }
  };

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

  return (
    <FadeIn transitionDuration={700} className='movie-app-root'>
      <h1>Movie Semantic Search 🍿</h1>
      <Collapse in={open}>
        <Alert
        className='alert-container'
        severity="info"
        icon={<InfoIcon fontSize="inherit" />}
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
          <AlertTitle>How to use?</AlertTitle>
          <span>This movie search engine utilizes GenAI to input natural language queries like "movies about computer scientists made after 2000", "interracial romance", etc. Based on the sentence, it uses context-based sorting to prioritize relevant results.</span>
        </Alert>
      </Collapse>

      <div className='search-form-wrapper'>
        <Paper
          className='search-form'
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder='Enter your prompt to search movies (Examples: "sad movies with animals", "scary pandemic", "aliens on mars")'
            inputProps={{ 'aria-label': 'search movies' }}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </div>

      <Accordion className='accordion-container'>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
        <span className='accordion-label'>
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
          Filter is being generated beased on the provided text...
        </span>
        </AccordionSummary>
        <AccordionDetails>
          <span>Loading...</span>
        </AccordionDetails>
      </Accordion>

      {isLoading && (
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

      <Grid container spacing={2} className='result-container'>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Grid container spacing={2}>
            {movieData && movieData.map((movie: any, index: number) => (
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} key={index}>
                <FadeIn transitionDuration={700} key={index}>
                  <div key={index} className='movie-poster zoom'>
                    <img
                      src={movie.poster_link}
                      alt={movie.title}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src=Alt;
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
  );
}

export default App;