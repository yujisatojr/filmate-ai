import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import FadeIn from './FadeIn';
import { Oval, ThreeDots } from 'react-loader-spinner'
import { TypeAnimation } from 'react-type-animation';
import { useRedirectFunctions } from '@propelauth/react';
import Explore from './Explore';
import MovieCard from './MovieCard';
import MyList from './MyList';
import Profile from './Profile';
import '../assets/styles/Home.scss';

// Import MUI components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

// Import icons
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Avatar from '@mui/material/Avatar';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import ExploreIcon from '@mui/icons-material/Explore';
import FilterListIcon from '@mui/icons-material/FilterList';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeIcon from '@mui/icons-material/Home';
import ListIcon from '@mui/icons-material/List';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';

type HomeProps = {
    isLoggedIn: boolean;
    user: any;
};

export type HomeHandles = {
    handleMyListClick: () => void;
    resetFilters: () => void;
    handleExploreClick: () => void;
};

const Home = forwardRef<HomeHandles, HomeProps>(({ isLoggedIn, user }: any, ref) => {

	const [userData, setUserData] = useState<any>(null);
	const {redirectToSignupPage, redirectToLoginPage} = useRedirectFunctions()

	const [initCall, setInitCall] = useState<number>(1);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [clickedDetail, setClickedDetail] = useState<boolean>(false);
	const [clickedMyList, setClickedMyList] = useState<boolean>(false);
	const [clickedExplore, setClickedExplore] = useState<boolean>(false);
	const [clickedProfile, setClickedProfile] = useState<boolean>(false);

	const [selectedProfile, setSelectedProfile] = useState({
		username: '',
		email: '',
		user_id: '',
		picture_url: ''
	});

	const [searchInput, setSearchInput] = useState<string>('');
	const [selectedCertificate, setSelectedCertificate] = useState({ G: true, PG: true, PG13: true, NC17: true, R: true, TVMA: true, Approved: true, NotRated: true });
	const [selectedGenre, setSelectedGenre] = useState({ Action: true, Adventure: true, Animation: true, Biography: true, Comedy: true, Crime: true, Documentary: true, Drama: true, Family: true, Fantasy: true, History: true, Horror: true, Musical: true, Mystery: true, Romance: true, SciFi: true, Sports: true, Thriller: true, War: true, Western: true });
	const [selectedPopularity, setSelectedPopularity] = useState<number[]>([1, 10]);
	const [selectedRuntime, setSelectedRuntime] = useState<number[]>([45, 240]);
	const [selectedSentiment, setSelectedSentiment] = useState<number[]>([0, 10]);
	const [selectedYear, setSelectedYear] = useState<number[]>([1915, 2024]);

	const [filterData, setFilterData] = useState<any>(null);
	const [recommendsData, setRecommendsData] = useState<any>(null);
	const [movieData, setMovieData] = useState<any>(null);
	const [movieDetail, setMovieDetail] = useState<any>(null);

	const [expanded, setExpanded] = React.useState<string | false>(false);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				await axios.post('/user', user);
			} catch (error) {
				console.log(error);
			}
		};

        if (isLoggedIn) {
			fetchUser();
        };
    }, [isLoggedIn, user]);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchInput(e.target.value);
	};

	const handleCertParentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const isChecked = event.target.checked;
		const updatedCertificate = Object.keys(selectedCertificate).reduce((acc: any, key) => {
		  acc[key] = isChecked;
		  return acc;
		}, {});
		setSelectedCertificate(updatedCertificate);
	};

	const handleCertChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = event.target;
		setSelectedCertificate(prevState => ({
			...prevState,
			[name]: checked,
		}));
	};

	const handleGenreParentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const isChecked = event.target.checked;
		const updatedGenre = Object.keys(selectedGenre).reduce((acc: any, key) => {
		  acc[key] = isChecked;
		  return acc;
		}, {});
		setSelectedGenre(updatedGenre);
	};

	const handleGenreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = event.target;
		setSelectedGenre(prevState => ({
			...prevState,
			[name]: checked,
		}));
	};

	const handlePopularityChange = (event: Event, newValue: number | number[]) => {
		setSelectedPopularity(newValue as number[]);
	};

	const handleRuntimeChange = (event: Event, newValue: number | number[]) => {
		setSelectedRuntime(newValue as number[]);
	};

	const handleSentimentChange = (event: Event, newValue: number | number[]) => {
		setSelectedSentiment(newValue as number[]);
	};

	const handleYearChange = (event: Event, newValue: number | number[]) => {
		setSelectedYear(newValue as number[]);
	};

	// Change state based on the values from child components
	const handleMovieChange = (data: any) => {
		setMovieDetail(data);
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});

		setClickedProfile(false);
		setClickedExplore(false);
		setClickedMyList(false);
		setClickedDetail(true);
	};

	const handleSelectedProfilechange = (data: any) => {
		setSelectedProfile({
			username: data.username,
			email: data.email,
			user_id: data.user_id,
			picture_url: data.picture_url,
		});

		setClickedProfile(true);
		setClickedExplore(false);
		setClickedMyList(false);
		setClickedDetail(false);
	};

	const handleClickedChange = () => {
		setClickedDetail(false)
	};
		
	const handleClick = (movie: any) => {
		setMovieDetail(movie);
		setClickedDetail(true);
	};

	const handleMyListClick = () => {
		setClickedMyList(true);
		setClickedExplore(false);
		setClickedDetail(false);
		setClickedProfile(false);
	};

	const handleExploreClick = () => {
		setClickedExplore(true);
		setClickedMyList(false);
		setClickedDetail(false);
		setClickedProfile(false);
	};

	const handleProfileClick = () => {
		setSelectedProfile({
			username: user.username,
			email: user.email,
			user_id: user.userId,
			picture_url: user.pictureUrl,
		})

		setClickedProfile(true);
		setClickedExplore(false);
		setClickedMyList(false);
		setClickedDetail(false);
	};

	const handleSearchSubmit = () => {
		setClickedProfile(false);
		setClickedExplore(false);
		setClickedMyList(false);
		setClickedDetail(false);
		const newData: any = {
			searchInput,
			selectedCertificate,
			selectedGenre,
			selectedPopularity,
			selectedRuntime,
			selectedSentiment,
			selectedYear
		};
		setFilterData(newData);
	};

	useEffect(() => {
        if (isLoggedIn) {
            setUserData(user);
        }
    }, [isLoggedIn, user]);

	useEffect(() => {
		setIsLoading(true);
		const fetchData = async () => {
			try {
				const response = await axios.post('/search_movies', filterData);
				setMovieData(response.data);
				setIsLoading(false);
			} catch (error) {
				console.log(error);
				setIsLoading(false);
			}
		};

		const fetchRecommends = async () => {
			try {
				const response = await axios.get(`/generate_recommends?keyword=${searchInput}`);
				setRecommendsData(response.data);
			} catch (error) {
				console.log(error);
			}
		};

		if (filterData !== null) {
			fetchData();
			fetchRecommends();
		}

		return () => {
			// Cancel any ongoing requests here if needed
		};
	}, [filterData]);

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}, [clickedDetail]);

	useEffect(() => {
		setIsLoading(true);
		const fetchData = async () => {
			try {
				const response = await axios.get('/init_search');
				setMovieData(response.data);
				setIsLoading(false);
			} catch (error) {
				console.log(error);
				setIsLoading(false);
			}
		};

		fetchData();
	}, [initCall]);

	const resetFilters = () => {
		setIsLoading(false);
		setExpanded(false);
		setClickedDetail(false);
		setClickedMyList(false);
		setClickedExplore(false);
		setClickedProfile(false);
		setSearchInput('');
		setRecommendsData(null);
		setMovieData(null);
		setMovieDetail(null);
		setSelectedCertificate({ G: true, PG: true, PG13: true, NC17: true, R: true, TVMA: true, Approved: true, NotRated: true });
		setSelectedGenre({ Action: true, Adventure: true, Animation: true, Biography: true, Comedy: true, Crime: true, Documentary: true, Drama: true, Family: true, Fantasy: true, History: true, Horror: true, Musical: true, Mystery: true, Romance: true, SciFi: true, Sports: true, Thriller: true, War: true, Western: true });
		setSelectedPopularity([1, 10]);
		setSelectedRuntime([45, 240]);
		setSelectedSentiment([0, 10]);
		setSelectedYear([1915, 2024]);
		setInitCall(prev => prev + 1);
	};

	useImperativeHandle(ref, () => ({
        handleMyListClick,
        resetFilters,
        handleExploreClick
    }));

	const [state, setState] = useState<boolean>(false);

	const toggleDrawer = (open: boolean) => {
      setState(open);
    };

  	const list = () => (
		<Box
		sx={{ width: 300 }}
		className="mobile_filters_drawer"
		role="presentation"
		>
		<div>
			<h3 className='mobile_filters'><FilterListIcon/> Filters</h3>

			<Grid container spacing={2}>
				<Grid className='button_container' item xs={6} sm={6} md={6} lg={6} xl={6}>
					<Button variant="contained" startIcon={<RestartAltIcon />} onClick={() => {resetFilters(); toggleDrawer(false);}}>
						RESET
					</Button>
				</Grid>
				<Grid className='button_container apply_filter_btn' item xs={6} sm={6} md={6} lg={6} xl={6}>
					<Button variant="contained" startIcon={<DoneOutlineIcon />} onClick={() => {handleSearchSubmit(); toggleDrawer(false);}}>
						APPLY
					</Button>
				</Grid>
			</Grid>

			<Accordion className='accordion_container' expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
				<AccordionSummary
				expandIcon={<ArrowDropDownIcon />}
				aria-controls="panel2-content"
				id="panel2-header"
				>
				Content Rating
				</AccordionSummary>
				<AccordionDetails>
					<FormControl component="fieldset" sx={{ m: 3 }} variant="standard">
						<FormGroup className='select_form_group'>
							<FormControlLabel
							control={
								<Checkbox
								checked={Object.values(selectedCertificate).every(val => val)}
								onChange={handleCertParentChange}
								/>
							}
							label="Select All"
							/>
							{Object.entries(selectedCertificate).map(([key, value]) => (
							<FormControlLabel
								key={key}
								control={
								<Checkbox checked={value} onChange={handleCertChange} name={key} />
								}
								label={key === 'PG13' ? 'PG-13' : key === 'NC17' ? 'NC-17' : key === 'TVMA' ? 'TV-MA' : key === 'NotRated' ? 'Not Rated' : key}
							/>
							))}
						</FormGroup>
					</FormControl>
				</AccordionDetails>
			</Accordion>

			<Accordion className='accordion_container' expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
				<AccordionSummary
				expandIcon={<ArrowDropDownIcon />}
				aria-controls="panel2-content"
				id="panel2-header"
				>
				Genre
				</AccordionSummary>
				<AccordionDetails>
					<FormControl component="fieldset" sx={{ m: 3 }} variant="standard">
						<FormGroup className='select_form_group'>
							<FormControlLabel
							control={
								<Checkbox
								checked={Object.values(selectedGenre).every(val => val)}
								onChange={handleGenreParentChange}
								/>
							}
							label="Select All"
							/>
							{Object.entries(selectedGenre).map(([key, value]) => (
							<FormControlLabel
								key={key}
								control={
								<Checkbox checked={value} onChange={handleGenreChange} name={key} />
								}
								label={key === 'SciFi' ? 'Sci-Fi' : key}
							/>
							))}
						</FormGroup>
					</FormControl>
				</AccordionDetails>
			</Accordion>

			<Accordion className='accordion_container' expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
				<AccordionSummary
				expandIcon={<ArrowDropDownIcon />}
				aria-controls="panel2-content"
				id="panel2-header"
				>
				Popularity
				</AccordionSummary>
				<AccordionDetails>
					<Slider
						getAriaLabel={() => 'Popularity range'}
						value={selectedPopularity}
						onChange={handlePopularityChange}
						valueLabelDisplay="auto"
						shiftStep={1}
						step={1}
						marks
						min={1}
						max={10}
					/>
					<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
						<Typography
						variant="body2"
						sx={{ cursor: 'pointer' }}
						>
						Minor
						</Typography>
						<Typography
						variant="body2"
						sx={{ cursor: 'pointer' }}
						>
						Popular
						</Typography>
					</Box>
				</AccordionDetails>
			</Accordion>

			<Accordion className='accordion_container' expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
				<AccordionSummary
				expandIcon={<ArrowDropDownIcon />}
				aria-controls="panel2-content"
				id="panel2-header"
				>
				Runtime
				</AccordionSummary>
				<AccordionDetails>
					<Slider
						getAriaLabel={() => 'Runtime range'}
						value={selectedRuntime}
						onChange={handleRuntimeChange}
						valueLabelDisplay="auto"
						shiftStep={10}
						step={10}
						min={45}
						max={240}
					/>
					<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
						<Typography
						variant="body2"
						sx={{ cursor: 'pointer' }}
						>
						45 minutes
						</Typography>
						<Typography
						variant="body2"
						sx={{ cursor: 'pointer' }}
						>
						240 minutes
						</Typography>
					</Box>
				</AccordionDetails>
			</Accordion>

			<Accordion className='accordion_container' expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
				<AccordionSummary
				expandIcon={<ArrowDropDownIcon />}
				aria-controls="panel2-content"
				id="panel2-header"
				>
				Sentiment
				</AccordionSummary>
				<AccordionDetails>
					<Slider
						getAriaLabel={() => 'Sentiment range'}
						value={selectedSentiment}
						onChange={handleSentimentChange}
						valueLabelDisplay="auto"
						shiftStep={1}
						step={1}
						min={0}
						max={10}
					/>
					<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
						<Typography
						variant="body2"
						sx={{ cursor: 'pointer' }}
						>
						Sad Movie
						</Typography>
						<Typography
						variant="body2"
						sx={{ cursor: 'pointer' }}
						>
						Happy Movie
						</Typography>
					</Box>
				</AccordionDetails>
			</Accordion>

			<Accordion className='accordion_container' expanded={expanded === 'panel7'} onChange={handleChange('panel7')}>
				<AccordionSummary
				expandIcon={<ArrowDropDownIcon />}
				aria-controls="panel2-content"
				id="panel2-header"
				>
				Year
				</AccordionSummary>
				<AccordionDetails>
					<Slider
						getAriaLabel={() => 'Year range'}
						value={selectedYear}
						onChange={handleYearChange}
						valueLabelDisplay="auto"
						shiftStep={1}
						step={1}
						marks
						min={1915}
						max={2024}
					/>
					<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
						<Typography
						variant="body2"
						sx={{ cursor: 'pointer' }}
						>
						1915
						</Typography>
						<Typography
						variant="body2"
						sx={{ cursor: 'pointer' }}
						>
						2024
						</Typography>
					</Box>
				</AccordionDetails>
			</Accordion>
		</div>
		</Box>
  	);

  	return (
	<div className='movie_app_root'>
		<FadeIn transitionDuration={700}>
			<Grid container spacing={2} className='mobile_grid_container'>
				<div className='mobile_search_wrapper'>
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
							placeholder='Find movies'
							inputProps={{ 'aria-label': 'search movies' }}
							value={searchInput}
							onChange={handleInputChange}
							/>
							<IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
								<SearchIcon />
							</IconButton>
						</Paper>
						<Button className='mobile_filter_btn' variant="contained" startIcon={<FilterListIcon />} onClick={() => {toggleDrawer(true)}}></Button>				
					</div>

					<Accordion className='accordion_container'>
						<AccordionSummary
						expandIcon={<ArrowDropDownIcon />}
						aria-controls="panel2-content"
						id="panel2-header"
						>
						{isLoading ? (
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
								Generating recommends based on input...
							</span>
						) : (
							<span className='accordion_label'>
								{recommendsData ? (
								<><AutoAwesomeIcon/> Finished generating recommends!</>
								) : (
								<><AutoAwesomeIcon/> View AI recommendations</>
								)}
							</span>
						)}
						</AccordionSummary>

						<AccordionDetails className='accordion_details_container'>
						{(!isLoading && recommendsData) ? (
							<Alert
							className='alert_container filter_list'
							severity="info"
							sx={{ mb: 2 }}
							>
								<TypeAnimation
								sequence={[
									`${recommendsData['insights'] !== '' ? recommendsData['insights'] : ''}`,
								]}
								speed={{ type: 'keyStrokeDelayInMs', value: 30 }}
								style={{ fontSize: '1em', display: 'block'}}
								cursor={false}
								/>
							</Alert>
						) : (
							<Alert
							className='alert_container filter_list'
							severity="info"
							sx={{ mb: 2 }}
							>
								<span>Type keywords in the search bar to generate personalized movie recommendations 😎</span>
							</Alert>
						)}
						</AccordionDetails>
					</Accordion>
				</div>
				<div className='dashboard_left sidebar_filter'>
					<div className="profile_container" onClick={() => {isLoggedIn ? handleProfileClick() : redirectToLoginPage()}}>
						{userData ? (
							<>
								<img className='image_circle' alt={userData.username} src={userData.pictureUrl}/>
								<div>
									<h1>@{userData && userData.username}</h1>
									<div className="followers_numbers">
										<span>Click to view your profile</span>
									</div>
								</div>
							</>
						) : (
							<>
								<IconButton sx={{ p: 0 }}>
									<Avatar alt="John Doe" />
								</IconButton>
								<div className='user_not_authorized'><span onClick={() => {redirectToSignupPage();}}>Sign up</span> to gain full access to various features on the app.</div>
							</>
						)}
					</div>

					<Grid container spacing={2}>
						<Grid className='menu_button' item xs={12} sm={12} md={12} lg={12} xl={12}>
							<Button variant="contained" startIcon={<HomeIcon />} onClick={resetFilters}>
								Home
							</Button>
						</Grid>
						<Grid className='menu_button' item xs={12} sm={12} md={12} lg={12} xl={12}>
							<Button variant="contained" startIcon={<ListIcon />} onClick={() => {isLoggedIn ? handleMyListClick() : redirectToLoginPage()}}>
								MyList
							</Button>
						</Grid>
						<Grid className='menu_button' item xs={12} sm={12} md={12} lg={12} xl={12}>
							<Button variant="contained" startIcon={<ExploreIcon />} onClick={() => {isLoggedIn ? handleExploreClick() : redirectToLoginPage()}}>
								Explore
							</Button>
						</Grid>
						<Grid className='menu_button' item xs={12} sm={12} md={12} lg={12} xl={12}>
							<Button variant="contained" startIcon={<HelpOutlineIcon />} >
								Help
							</Button>
						</Grid>
					</Grid>
				</div>
				
				<div className='dashboard_middle'>
					{isLoading && (
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

					{!isLoading && !clickedDetail && !clickedMyList && !clickedExplore && !clickedProfile && (
					<FadeIn transitionDuration={700}>
						<Grid container spacing={2} className='result_container'>
							<Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
								<Grid container spacing={2}>
								{movieData && movieData.map((movie: any, index: number) => (
									<Grid item xs={6} sm={6} md={3} lg={3} xl={3} key={index}>
										<FadeIn transitionDuration={700} key={index}>
											<div key={index} className='movie_img zoom' onClick={() => handleClick(movie)}>
												<img className='image_fill' alt={movie.title} src={movie.img}/>
											</div>
										</FadeIn>
									</Grid>
								))}
								</Grid>
							</Grid>
						</Grid>
					</FadeIn>
					)}

					<React.StrictMode>
						<MovieCard
						parentToChild={{ movieDetail, isLoading, clickedDetail }}
						movieChange={handleMovieChange}
						clickedChange={handleClickedChange}
						/>
					</React.StrictMode>

					{clickedMyList && !clickedExplore && !clickedProfile && (
						<React.StrictMode>
							<MyList/>
						</React.StrictMode>
					)}

					{clickedExplore && !clickedMyList && !clickedProfile && (
						<React.StrictMode>
							<Explore
							selectedProfileChange={handleSelectedProfilechange}
							/>
						</React.StrictMode>
					)}

					{clickedProfile && !clickedMyList && !clickedExplore && (
						<React.StrictMode>
							<Profile 
							parentToChild={{ selectedProfile: selectedProfile, user: user, isLoggedIn: isLoggedIn }}
							movieChange={handleMovieChange}
							/>
						</React.StrictMode>
					)}
				</div>

				<div className='dashboard_right'>
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
							placeholder='Find movies'
							inputProps={{ 'aria-label': 'search movies' }}
							value={searchInput}
							onChange={handleInputChange}
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
						{isLoading ? (
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
								Generating recommends based on input...
							</span>
						) : (
							<span className='accordion_label'>
								{recommendsData ? (
								<><AutoAwesomeIcon/> Finished generating recommends!</>
								) : (
								<><AutoAwesomeIcon/> View AI recommendations</>
								)}
							</span>
						)}
						</AccordionSummary>

						<AccordionDetails className='accordion_details_container'>
						{(!isLoading && recommendsData) ? (
							<Alert
							className='alert_container filter_list'
							severity="info"
							sx={{ mb: 2 }}
							>
								<TypeAnimation
								sequence={[
									`${recommendsData['insights'] !== '' ? recommendsData['insights'] : ''}`,
								]}
								speed={{ type: 'keyStrokeDelayInMs', value: 30 }}
								style={{ fontSize: '1em', display: 'block'}}
								cursor={false}
								/>
							</Alert>
						) : (
							<Alert
							className='alert_container filter_list'
							severity="info"
							sx={{ mb: 2 }}
							>
								<span>Type keywords in the search bar to generate personalized movie recommendations 😎</span>
							</Alert>
						)}
						</AccordionDetails>
					</Accordion>

					<Grid container spacing={2}>
						<Grid className='button_container' item xs={6} sm={6} md={6} lg={6} xl={6}>
							<Button variant="contained" startIcon={<RestartAltIcon />} onClick={resetFilters}>
								RESET
							</Button>
						</Grid>
						<Grid className='button_container apply_filter_btn' item xs={6} sm={6} md={6} lg={6} xl={6}>
							<Button variant="contained" startIcon={<DoneOutlineIcon />} onClick={handleSearchSubmit}>
								APPLY
							</Button>
						</Grid>
					</Grid>

					<Accordion className='accordion_container' expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
						<AccordionSummary
						expandIcon={<ArrowDropDownIcon />}
						aria-controls="panel2-content"
						id="panel2-header"
						>
						Content Rating
						</AccordionSummary>
						<AccordionDetails>
							<FormControl component="fieldset" sx={{ m: 3 }} variant="standard">
								<FormGroup className='select_form_group'>
									<FormControlLabel
									control={
										<Checkbox
										checked={Object.values(selectedCertificate).every(val => val)}
										onChange={handleCertParentChange}
										/>
									}
									label="Select All"
									/>
									{Object.entries(selectedCertificate).map(([key, value]) => (
									<FormControlLabel
										key={key}
										control={
										<Checkbox checked={value} onChange={handleCertChange} name={key} />
										}
										label={key === 'PG13' ? 'PG-13' : key === 'NC17' ? 'NC-17' : key === 'TVMA' ? 'TV-MA' : key === 'NotRated' ? 'Not Rated' : key}
									/>
									))}
								</FormGroup>
							</FormControl>
						</AccordionDetails>
					</Accordion>

					<Accordion className='accordion_container' expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
						<AccordionSummary
						expandIcon={<ArrowDropDownIcon />}
						aria-controls="panel2-content"
						id="panel2-header"
						>
						Genre
						</AccordionSummary>
						<AccordionDetails>
							<FormControl component="fieldset" sx={{ m: 3 }} variant="standard">
								<FormGroup className='select_form_group'>
									<FormControlLabel
									control={
										<Checkbox
										checked={Object.values(selectedGenre).every(val => val)}
										onChange={handleGenreParentChange}
										/>
									}
									label="Select All"
									/>
									{Object.entries(selectedGenre).map(([key, value]) => (
									<FormControlLabel
										key={key}
										control={
										<Checkbox checked={value} onChange={handleGenreChange} name={key} />
										}
										label={key === 'SciFi' ? 'Sci-Fi' : key}
									/>
									))}
								</FormGroup>
							</FormControl>
						</AccordionDetails>
					</Accordion>

					<Accordion className='accordion_container' expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
						<AccordionSummary
						expandIcon={<ArrowDropDownIcon />}
						aria-controls="panel2-content"
						id="panel2-header"
						>
						Popularity
						</AccordionSummary>
						<AccordionDetails>
							<Slider
								getAriaLabel={() => 'Popularity range'}
								value={selectedPopularity}
								onChange={handlePopularityChange}
								valueLabelDisplay="auto"
								shiftStep={1}
								step={1}
								marks
								min={1}
								max={10}
							/>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography
								variant="body2"
								sx={{ cursor: 'pointer' }}
								>
								Minor
								</Typography>
								<Typography
								variant="body2"
								sx={{ cursor: 'pointer' }}
								>
								Popular
								</Typography>
							</Box>
						</AccordionDetails>
					</Accordion>

					<Accordion className='accordion_container' expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
						<AccordionSummary
						expandIcon={<ArrowDropDownIcon />}
						aria-controls="panel2-content"
						id="panel2-header"
						>
						Runtime
						</AccordionSummary>
						<AccordionDetails>
							<Slider
								getAriaLabel={() => 'Runtime range'}
								value={selectedRuntime}
								onChange={handleRuntimeChange}
								valueLabelDisplay="auto"
								shiftStep={10}
								step={10}
								min={45}
								max={240}
							/>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography
								variant="body2"
								sx={{ cursor: 'pointer' }}
								>
								45 minutes
								</Typography>
								<Typography
								variant="body2"
								sx={{ cursor: 'pointer' }}
								>
								240 minutes
								</Typography>
							</Box>
						</AccordionDetails>
					</Accordion>

					<Accordion className='accordion_container' expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
						<AccordionSummary
						expandIcon={<ArrowDropDownIcon />}
						aria-controls="panel2-content"
						id="panel2-header"
						>
						Sentiment
						</AccordionSummary>
						<AccordionDetails>
							<Slider
								getAriaLabel={() => 'Sentiment range'}
								value={selectedSentiment}
								onChange={handleSentimentChange}
								valueLabelDisplay="auto"
								shiftStep={1}
								step={1}
								min={0}
								max={10}
							/>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography
								variant="body2"
								sx={{ cursor: 'pointer' }}
								>
								Sad Movie
								</Typography>
								<Typography
								variant="body2"
								sx={{ cursor: 'pointer' }}
								>
								Happy Movie
								</Typography>
							</Box>
						</AccordionDetails>
					</Accordion>

					<Accordion className='accordion_container' expanded={expanded === 'panel7'} onChange={handleChange('panel7')}>
						<AccordionSummary
						expandIcon={<ArrowDropDownIcon />}
						aria-controls="panel2-content"
						id="panel2-header"
						>
						Year
						</AccordionSummary>
						<AccordionDetails>
							<Slider
								getAriaLabel={() => 'Year range'}
								value={selectedYear}
								onChange={handleYearChange}
								valueLabelDisplay="auto"
								shiftStep={1}
								step={1}
								marks
								min={1915}
								max={2024}
							/>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography
								variant="body2"
								sx={{ cursor: 'pointer' }}
								>
								1915
								</Typography>
								<Typography
								variant="body2"
								sx={{ cursor: 'pointer' }}
								>
								2024
								</Typography>
							</Box>
						</AccordionDetails>
					</Accordion>
				</div>
			</Grid>
		</FadeIn>
		<React.Fragment>
			<Drawer
				className='mui-drawer_mobile'
				anchor='right'
				open={state}
				onClose={() => {toggleDrawer(false)}}
			>
				{list()}
			</Drawer>
		</React.Fragment>
	</div>
  );
});
  
export default Home;