import React, { useState } from 'react';
import './App.scss';
import Alt from './assets/images/no_image.png'
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
  const [searchInput, setSearchInput] = useState('');
  const [movieData, setMovieData] = useState<any>(null);

  const handleSearchSubmit = async () => {
    // console.log(searchInput);
    try {
      const response = await fetch(`/search_movies?user_query=${searchInput}`);
      if (response.ok) {
        const data = await response.json();
        console.log(await data);
        setMovieData(await data);
      } else {
        console.error('Error fetching movie data');
      }
    } catch (error) {
      console.error('Error fetching movie data:', error);
    }
  };

  return (
    <FadeIn transitionDuration={700} className='movie-app-root'>
      <h1>Movie Search 🍿</h1>
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
            placeholder="Search movies using prompt"
            inputProps={{ 'aria-label': 'search movies' }}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </div>

      <Grid container spacing={2} className='result-container'>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Grid container spacing={2}>
            {movieData && movieData.map((movie: any, index: number) => (
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                <FadeIn transitionDuration={700}>
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