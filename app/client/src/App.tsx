import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FadeIn from 'react-fade-in';
import { Oval, ThreeDots } from 'react-loader-spinner'
import Alt from './assets/images/no_image.png'
import './App.scss';

// Import MUI components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
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
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import SearchIcon from '@mui/icons-material/Search';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function App() {

  const [searchInput, setSearchInput] = useState<string>('');
  const [filterData, setFilterData] = useState<any>(null);
  const [movieData, setMovieData] = useState<any>(null);

  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [initRequest, setInitRequest] = useState<boolean>(false);

  const handleSearchSubmit = async () => {
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

  const checkValues = (data: any) => {
    for (const key in data) {
      if (key !== 'query') {
        if (typeof data[key] === 'object') {
          const { condition, value_1, value_2 } = data[key];
          if (condition !== null && condition !== undefined && condition !== '') {
            return true;
          }
          if (value_1 !== null && value_1 !== undefined && value_1 !== '') {
            return true;
          }
          if (value_2 !== null && value_2 !== undefined && value_2 !== '') {
            return true;
          }
        } else {
          if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
            return true;
          }
        }
      }
    }
    return false;
  };

  useEffect(() => {
    handleSearchSubmit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(filterData)

  return (
    <FadeIn transitionDuration={700} className='movie-app-root'>
      <div className='header'>
        <h1>Smart Movie Search 🍿</h1>
        <Button className='button-desktop' variant="contained" endIcon={<HelpIcon />} onClick={() => {
              setOpen(true);
            }}>
          Help
        </Button>
        <HelpCenterIcon className='button-mobile' onClick={() => {setOpen(true);}}/>
      </div>
      <Collapse in={open}>
        <Alert
        className='alert-container'
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
          <AlertTitle>How to use?</AlertTitle>
          <span>This movie search app is powered by GenAI to handle natural language queries such as 'movies about computer scientists created after 2000' or 'happy romance after 2000 made more than 60000 dollars'. Once you provide an input sentence, the app uses a context-based sorting algorithm to prioritize relevant results.</span>
        </Alert>
      </Collapse>

      <div className='search-form-wrapper'>
        <Paper
          className='search-form'
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
            placeholder='Enter a prompt to search for movies'
            inputProps={{ 'aria-label': 'search movies' }}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </div>

      {((isFilterLoading || (movieData != null && movieData.length > 0)) && initRequest !== false) && (
      <Accordion className='accordion-container'>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
        {isFilterLoading ? (
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
            Filter is being generated based on the provided text...
          </span>
        ) : (
          <span className='accordion-label'>
            <CheckCircleIcon/> 
            Filter has been generated based on your text!
          </span>
        )}
        </AccordionSummary>
        <AccordionDetails>
          {(!isFilterLoading && filterData) ? (
            <Alert
            className='alert-container filter-list'
            severity="info"
            sx={{ mb: 2 }}
            >
              {checkValues(filterData) ? (<p>The following filters have been generated based on your text:</p>) : (<p>The sentence you provided contained only keywords so it performed a semantic search.</p>)}
              {checkValues(filterData) && (<p>Original sentence: {filterData['query']}</p>)}
              {(filterData['date']['condition'] !== '' && filterData['date']['date_1'] !== '') && (
                  filterData['date']['condition'] === 'after' ? (
                      <p>Date: after {formatDate(filterData['date']['date_1'])}</p>
                  ) : (
                      filterData['date']['condition'] === 'before' ? (
                          <p>Date: before {formatDate(filterData['date']['date_1'])}</p>
                      ) : (
                        filterData['date']['condition'] === 'between' && (
                          <p>Date: between {formatDate(filterData['date']['date_1'])} and {formatDate(filterData['date']['date_2'])}</p>
                        )
                      )
                  )
              )}
              {filterData['budget']['condition'] !== '' && (
                  filterData['budget']['condition'] === 'greater_than' ? (
                      <p>Budget: over ${filterData['budget']['budget_1']}</p>
                  ) : (
                      filterData['budget']['condition'] === 'less_than' ? (
                          <p>Budget: less than ${filterData['budget']['budget_1']}</p>
                      ) : (
                          <p>Budget: Between ${filterData['budget']['budget_1']} and ${filterData['budget']['budget_2']}</p>
                      )
                  )
              )}
              {filterData['revenue']['condition'] !== '' && (
                  filterData['revenue']['condition'] === 'greater_than' ? (
                      <p>Revenue: over ${filterData['revenue']['revenue_1']}</p>
                  ) : (
                      filterData['revenue']['condition'] === 'less_than' ? (
                          <p>Revenue: less than ${filterData['revenue']['revenue_1']}</p>
                      ) : (
                          <p>Revenue: Between ${filterData['revenue']['revenue_1']} and ${filterData['revenue']['revenue_2']}</p>
                      )
                  )
              )}
              {filterData['rating']['condition'] !== '' && (
                  filterData['rating']['condition'] === 'greater_than' ? (
                      <p>IMDb Rating: over {filterData['rating']['rating_1']}</p>
                  ) : (
                      filterData['rating']['condition'] === 'less_than' ? (
                          <p>IMDb Rating: less than ${filterData['rating']['rating_1']}</p>
                      ) : (
                          <p>IMDb Rating: Between ${filterData['rating']['rating_1']} and ${filterData['rating']['rating_2']}</p>
                      )
                  )
              )}
              {filterData['runtime']['condition'] !== '' && (
                  filterData['runtime']['condition'] === 'greater_than' ? (
                      <p>Runtime: over ${filterData['runtime']['runtime_1']}</p>
                  ) : (
                      filterData['runtime']['condition'] === 'less_than' ? (
                          <p>Runtime: less than ${filterData['runtime']['runtime_1']}</p>
                      ) : (
                          <p>Runtime: between ${filterData['runtime']['runtime_1']} and ${filterData['runtime']['runtime_2']}</p>
                      )
                  )
              )}
              {filterData['genres'] !== '' && (<p>Genre: {filterData['genres']}</p>)}
              {filterData['language'] !== '' && (<p>Language: {filterData['language']}</p>)}
              {filterData['sentiment'] !== '' && (<p>Sentiment: {filterData['sentiment']}</p>)}
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