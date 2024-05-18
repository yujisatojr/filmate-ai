import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FadeIn from './FadeIn';
import { Oval, ThreeDots } from 'react-loader-spinner'
import { TypeAnimation } from 'react-type-animation';
import {withAuthInfo} from '@propelauth/react';
import MovieCard from './MovieCard';
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
import Collapse from '@mui/material/Collapse';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import HelpIcon from '@mui/icons-material/Help';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';

function Home({ isLoggedIn, user }: any) {
	const [initCall, setInitCall] = useState<number>(1);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [open, setOpen] = useState<boolean>(false);
	const [clicked, setClicked] = useState<boolean>(false);

	const [searchInput, setSearchInput] = useState<string>('');
	const [selectedCertificate, setSelectedCertificate] = useState({ G: true, PG: true, PG13: true, NC17: true, R: true, TVMA: true, Approved: true, NotRated: true });
	const [selectedGenre, setSelectedGenre] = useState({ Action: true, Adventure: true, Animation: true, Biography: true, Comedy: true, Crime: true, Documentary: true, Drama: true, Family: true, Fantasy: true, History: true, Horror: true, Musical: true, Mystery: true, Romance: true, SciFi: true, Sports: true, Thriller: true, War: true, Western: true });
	const [selectedPopularity, setSelectedPopularity] = useState<number[]>([1, 10]);
	// const [selectedRating, setSelectedRating] = useState<number[]>([0, 10]);
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
				const response = await axios.post('/get_user', user);
				console.log(response);
			} catch (error) {
				console.log(error);
			}
		};

        if (isLoggedIn) {
			fetchUser();
            // console.log('User is logged in.');
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

	// const handleRatingChange = (event: Event, newValue: number | number[]) => {
	// 	setSelectedRating(newValue as number[]);
	// };

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
		// setClicked(true);
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};

	const handleClickedChange = () => {
		setClicked(false)
	};
		
	const handleClick = (movie: any) => {
		setMovieDetail(movie);
		setClicked(true);
	};

	const handleSearchSubmit = () => {
		setClicked(false);
		const newData: any = {
			searchInput,
			selectedCertificate,
			selectedGenre,
			selectedPopularity,
			// selectedRating,
			selectedRuntime,
			selectedSentiment,
			selectedYear
		};
		setFilterData(newData);
	};

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
	}, [clicked]);

	useEffect(() => {
		// handleSearchSubmit();
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
		setOpen(false);
		setExpanded(false);
		setClicked(false);
		setSearchInput('');
		setMovieData(null);
		setMovieDetail(null);
		setSelectedCertificate({ G: true, PG: true, PG13: true, NC17: true, R: true, TVMA: true, Approved: true, NotRated: true });
		setSelectedGenre({ Action: true, Adventure: true, Animation: true, Biography: true, Comedy: true, Crime: true, Documentary: true, Drama: true, Family: true, Fantasy: true, History: true, Horror: true, Musical: true, Mystery: true, Romance: true, SciFi: true, Sports: true, Thriller: true, War: true, Western: true });
		setSelectedPopularity([1, 10]);
		// setSelectedRating([0, 10]);
		setSelectedRuntime([45, 240]);
		setSelectedYear([1915, 2024]);
		setInitCall(prev => prev + 1);
	};

  	return (
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
								<><CheckCircleIcon/> Finished generating recommends!</>
								) : (
								<><CheckCircleIcon/> No user query found!</>
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
								<span>Please enter your query to generate personalized movie recommendations 😎</span>
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
								APPLY FILTERS
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

					{/* <Accordion className='accordion_container' expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
						<AccordionSummary
						expandIcon={<ArrowDropDownIcon />}
						aria-controls="panel2-content"
						id="panel2-header"
						>
						Rating
						</AccordionSummary>
						<AccordionDetails>
							<Slider
								getAriaLabel={() => 'Rating range'}
								value={selectedRating}
								onChange={handleRatingChange}
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
								0 star
								</Typography>
								<Typography
								variant="body2"
								sx={{ cursor: 'pointer' }}
								>
								10 stars
								</Typography>
							</Box>
						</AccordionDetails>
					</Accordion> */}

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
				</Grid>
				
				<Grid className='right_container' item xs={12} sm={12} md={8.5} lg={8.5} xl={8.5}>
					<Collapse in={open}>
						<Alert
						className='alert_container'
						severity="info"
						icon={<HelpIcon fontSize="inherit" />}
						sx={{ mb: 2 }}
						action={
							<IconButton
							aria-label="close"
							color="inherit"
							size="small"
							onClick={() => {setOpen(false);}}>
								<CloseIcon fontSize="inherit" />
							</IconButton>
						}>
							<span className='instruction'>This movie search app uses GenAI to handle natural language queries beyond the traditional keyword search. The app also provides recommendations on movie titles and directors based on the input sentences. Try out the following three search patterns:</span>
							<ol>
								<li>Semantic search based on context and concepts: For example, using the word "Ocean" will yield hits related to summer, ships, and blue, etc.</li>
								<li>Sentiment analysis based on emotion: For example, "happy movie" and "sad movie" will sort movies based on their content mood.</li>
								<li>Filter search based on words or phrases: It supports flexible searches including movie titles, director names, content, and revenues.</li>
							</ol>
						</Alert>
					</Collapse>

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

					{!isLoading && !clicked && (
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
						parentToChild={{ movieDetail, isLoading, clicked }}
						movieChange={handleMovieChange}
						clickedChange={handleClickedChange}
						/>
					</React.StrictMode>
				</Grid>
			</Grid>
		</FadeIn>
	</div>
  );
};
  
export default withAuthInfo(Home);