import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FadeIn from 'react-fade-in';
import { Oval, ThreeDots } from 'react-loader-spinner'
import { TypeAnimation } from 'react-type-animation';
import MovieCard from './MovieCard';
import '../assets/styles/Home.scss';

// Import MUI components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { SelectChangeEvent } from '@mui/material/Select';

// Import icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';

function Home() {
	const [searchInput, setSearchInput] = useState<string>('');
	const [filterData, setFilterData] = useState<any>(null);
	const [movieData, setMovieData] = useState<any>(null);
	const [movieDetail, setMovieDetail] = useState<any>(null);

	const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);
	const [open, setOpen] = useState<boolean>(false);
	const [clicked, setClicked] = useState<boolean>(false);

	const [selectedGenre, setGenre] = useState('All');
	const [selectedCertificate, setCertificate] = useState('All');
	
	const genres = [
		'All', 'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 
		'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 
		'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sports', 'Thriller', 
		'War', 'Western'
	];
  
	const certificates = [
		'All', 'G', 'PG', 'TV-PG', 'PG-13', 'TV-14', 'R', 'TV-MA'
	];

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
		
	const handleGenreChange = (event: SelectChangeEvent) => {
		setGenre(event.target.value as string);
	};
	
	const handleCertChange = (event: SelectChangeEvent) => {
		setCertificate(event.target.value as string);
	};

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
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchInput(e.target.value);
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

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}, [clicked]);

	useEffect(() => {
		handleSearchSubmit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	console.log(filterData)
	// console.log(searchInput)

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
								Generating recommends based on input...
							</span>
						) : (
							<span className='accordion_label'>
								{filterData && filterData['insights'] !== '' ? (
								<><CheckCircleIcon/> Finished generating recommends!</>
								) : (
								<><CheckCircleIcon/> No user query found!</>
								)}
							</span>
						)}
						</AccordionSummary>

						<AccordionDetails className='accordion_details_container'>
						{(!isFilterLoading && filterData && filterData['insights'] !== '') ? (
							<Alert
							className='alert_container filter_list'
							severity="info"
							sx={{ mb: 2 }}
							>
								<TypeAnimation
								sequence={[
									`
									${filterData['sentiment'] === 'positive' ? 'The search results have been tailored to include only movies that align with the positive emotions based on your input.\n' : ''}
									${filterData['sentiment'] === 'negative' ? 'The search results have been tailored to include only movies that align with the negative emotions based on your input.\n': ''}
									${filterData['insights'] !== '' ? filterData['insights'] : ''}
									`,
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
						parentToChild={{ movieDetail, isFilterLoading, clicked }}
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
  
export default Home;