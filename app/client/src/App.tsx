import React, { useState } from 'react';
import './App.scss';
import { styled } from '@mui/material/styles';

// Import MUI framework for styling
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'left',
}));

function App() {

  // Define state variables
  const [searchInput, setSearchInput] = useState('');

  // Fetch geo-coordinates (lat/lon) with a city name
  const handleSearchSubmit = async () => {
    console.log(searchInput);
    // try {
    //   const response = await fetch(`/flask_server/coordinates?city_name=${searchInput}`);
    //   if (response.ok) {
    //     const data = await response.json();
    //     setLocations(data);
    //   } else {
    //     console.error('Error fetching location data');
    //   }
    // } catch (error) {
    //   console.error('Error fetching location data:', error);
    // }
  };

  return (
    <div className='movie-app-root'>
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
      
      <Item>
        <p>Content comes here</p>
      </Item>
    </div>
  );
}

export default App;