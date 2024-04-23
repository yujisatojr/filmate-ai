import { useEffect, useState } from 'react';
import axios from 'axios';
import FadeIn from 'react-fade-in';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Oval, ThreeDots } from 'react-loader-spinner'
import { TypeAnimation } from 'react-type-animation';
import { styled } from '@mui/material/styles';
import './App.scss';

// Import MUI components
import AppBar from '@mui/material/AppBar';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
// import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Rating from '@mui/material/Rating';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// Import icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const pages = ['About', 'Help', 'My List'];
const settings = ['Profile', 'Account', 'Logout'];

const StyledRating = styled(Rating)({  
  '& .MuiRating-iconFilled': {
    color: '#ff6d75',
  },
});

function convertToRating(sentimentScore: number) {
  // Normalize the range from -1 to 1 to 0 to 2
  var normalizedValue = sentimentScore + 1;
  
  // Scale the range from 0 to 2 to 0 to 5
  var newValue = normalizedValue * 2.5;
  newValue = Math.round(newValue * 10) / 10;
  
  return newValue;
}

function App() {
  const [searchInput, setSearchInput] = useState<string>('');
  const [filterData, setFilterData] = useState<any>(null);
  const [movieData, setMovieData] = useState<any>(null);
  const [movieDetail, setMovieDetail] = useState<any>(null);
  const [similarMoviesData, setSimilarMoviesData] = useState<any>(null);
  // const [segment, setSegments] = useState<any>([]);

  console.log(similarMoviesData)

  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);
  const [isSimilarLoading, setIsSimilarLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false);
  // const [initRequest, setInitRequest] = useState<boolean>(false);

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const [selectedGenre, setGenre] = useState('All');
  const [selectedCertificate, setCertificate] = useState('All');

  const handleGenreChange = (event: SelectChangeEvent) => {
    setGenre(event.target.value as string);
  };

  const handleCertChange = (event: SelectChangeEvent) => {
    setCertificate(event.target.value as string);
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

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

  const genres = [
    'All', 'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 
    'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sports', 'Thriller', 
    'War', 'Western'
  ];

  const certificates = [
    'All', 'G', 'PG', 'TV-PG', 'PG-13', 'TV-14', 'R', 'TV-MA'
  ]

  // console.log(filterData);
  // console.log(movieData);

  return (
  <>
    <AppBar className='navi-bar' position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            FILMATE
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            FILMATE
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="John Doe" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
    
    <div className='movie_app_root'>
      <FadeIn transitionDuration={700}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={3.5} className='sidebar_filter'>
            <div className='search_form_wrapper'>
              <Paper
                className='search_form'
                component="form"
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit();
                }}
              >
                <InputBase
                  className='input_form'
                  sx={{ ml: 1, flex: 1 }}
                  placeholder='Search with natural language query'
                  inputProps={{ 'aria-label': 'search movies' }}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                  <SearchIcon />
                </IconButton>
              </Paper>
            </div>
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
                  Generating recommends based on your query...
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

            <Accordion className='accordion_container'>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                Content Rating
              </AccordionSummary>
              <AccordionDetails>
                <FormControl>
                  <RadioGroup
                    row
                    aria-labelledby="radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    onChange={handleCertChange}
                    defaultValue='All'
                  >
                    {certificates.map(cert => (
                      <FormControlLabel key={cert} value={cert} control={<Radio />} label={cert} />
                  ))}
                  </RadioGroup>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            <Accordion className='accordion_container'>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                Genre
              </AccordionSummary>
              <AccordionDetails>
                <FormControl>
                  <RadioGroup
                    row
                    aria-labelledby="radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    onChange={handleGenreChange}
                    defaultValue='All'
                  >
                    {genres.map(genre => (
                      <FormControlLabel key={genre} value={genre} control={<Radio />} label={genre} />
                  ))}
                  </RadioGroup>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            <Accordion className='accordion_container'>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                Rating
              </AccordionSummary>
              <AccordionDetails>
                
              </AccordionDetails>
            </Accordion>

            <Accordion className='accordion_container'>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                Runtime
              </AccordionSummary>
              <AccordionDetails>
                
              </AccordionDetails>
            </Accordion>

            <Accordion className='accordion_container'>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                Sentiment
              </AccordionSummary>
              <AccordionDetails>
                
              </AccordionDetails>
            </Accordion>

            <Accordion className='accordion_container'>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                Year
              </AccordionSummary>
              <AccordionDetails>
                
              </AccordionDetails>
            </Accordion>

            {/* <FormControl fullWidth className='dropdown_form'>
              <InputLabel id="simple-select-label">Genre</InputLabel>
              <Select
                labelId="simple-select-label"
                id="simple-select"
                value={genre}
                label="Genre"
                onChange={handleGenreChange}
              >
                {genres.map(genre => (
                    <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                ))}
              </Select>
            </FormControl> */}
            {/* <FormControl fullWidth className='dropdown_form margin_top'>
              <InputLabel id="simple-select-label">Content Rating</InputLabel>
              <Select
                labelId="simple-select-label"
                id="simple-select"
                value={selectedCertificate}
                label="Certificate"
                onChange={handleCertChange}
              >
                {certificates.map(certificate => (
                    <MenuItem key={certificate} value={selectedCertificate}>{certificate}</MenuItem>
                ))}
              </Select>
            </FormControl> */}
          </Grid>
          
          <Grid className='right_container' item xs={12} sm={12} md={8.5} lg={8.5} xl={8.5}>
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

            {isFilterLoading && (
            <FadeIn transitionDuration={500}>
              <div className='loading'>
                <ThreeDots
                visible={true}
                height="60"
                width="60"
                color="white"
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
                      <Grid item xs={12} sm={12} md={3} lg={3} xl={3} key={index}>
                        <FadeIn transitionDuration={700} key={index}>
                          <div key={index} className='movie_img zoom' onClick={() => handleClick(movie)}>
                            <LazyLoadImage
                            className='image_fill'
                            alt={movie.title}
                            src={movie.img} // use normal <img> attributes as props
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
                        <LazyLoadImage
                        className='image_fill'
                        alt={movieDetail.title}
                        src={movieDetail.img} // use normal <img> attributes as props
                        />
                      </Grid>
                      <Grid className='right_area' item xs={12} sm={12} md={8} lg={8} xl={8}>
                        <div className='right_header'><h1>{movieDetail.title}<span> ({movieDetail.year})</span></h1><CloseIcon fontSize="inherit" onClick={() => setClicked(false)}/></div>
                        
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
                              name="customized-color"
                              className={
                                (movieDetail.sentiment < -0.7) ? 'very_low' :
                                (movieDetail.sentiment >= -0.7 && movieDetail.sentiment < -0.3) ? 'low' :
                                (movieDetail.sentiment >= -0.3 && movieDetail.sentiment < 0.3) ? 'neutral' :
                                (movieDetail.sentiment >= 0.3 && movieDetail.sentiment < 0.7) ? 'high' :
                                (movieDetail.sentiment >= 0.7 && movieDetail.sentiment <= 1) ? 'very_high' :
                                ''
                              }
                              value={convertToRating(movieDetail.sentiment)}
                              precision={0.1}
                              max={5}
                              icon={<SentimentSatisfiedIcon fontSize="inherit" />}
                              emptyIcon={<SentimentSatisfiedIcon fontSize="inherit" />}
                              style={{ color: 'blue' }}
                              readOnly
                            />
                            <p>{convertToRating(movieDetail.sentiment)}/5 (Low: Sad - High: Happy)</p>
                          </div>
                        </div>

                        {!isSimilarLoading ? (
                          <>
                          <h3>You may also like:</h3>
                          <Grid container spacing={2}>
                          {similarMoviesData && similarMoviesData.map((movie: any, index: number) => (
                            <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4} key={index}>
                              <FadeIn transitionDuration={700} key={index}>
                                <div key={index} className='movie_img zoom' onClick={() => handleClick(movie)}>
                                  <LazyLoadImage
                                  className='image_fill'
                                  alt={movie.title}
                                  src={movie.img} // use normal <img> attributes as props
                                  />
                                </div>
                              </FadeIn>
                            </Grid>
                          ))}
                          </Grid>
                          </>
                        ) : (<Skeleton variant="rounded" width="100%" height={150} />)}
                      </Grid>
                    </Grid>
                  </Item>
                </Grid>
              </Grid>
            </FadeIn>
            )}
          </Grid>
        </Grid>
      </FadeIn>
    </div>
    <p className='footer'>The app designed & created by Yuji Sato</p>
  </>
  );
}

export default App;