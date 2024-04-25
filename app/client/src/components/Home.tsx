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

// Import icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import HelpIcon from '@mui/icons-material/Help';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';

function runtimeFormat(value: number) {
	return `${value}min`;
}

function Home() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [open, setOpen] = useState<boolean>(false);
	const [clicked, setClicked] = useState<boolean>(false);

	const [searchInput, setSearchInput] = useState<string>('');
	const [selectedCertificate, setSelectedCertificate] = useState({ G: true, PG: true, PG13: true, PG14: true, TV14: true, R: true, TVMA: true, Approved: true, NotRated: true });
	const [selectedGenre, setSelectedGenre] = useState({ Action: true, Adventure: true, Animation: true, Biography: true, Comedy: true, Crime: true, Documentary: true, Drama: true, Family: true, Fantasy: true, History: true, Horror: true, Musical: true, Mystery: true, Romance: true, SciFi: true, Sports: true, Thriller: true, War: true, Western: true });
	const [selectedRating, setSelectedRating] = React.useState<number[]>([0, 10]);
	const [selectedRuntime, setSelectedRuntime] = React.useState<number[]>([30, 240]);
	const [selectedSentiment, setSelectedSentiment] = useState<string>('All');
	const [selectedYear, setSelectedYear] = React.useState<number[]>([1915, 2024]);

	const { G, PG, PG13, PG14, TV14, R, TVMA, Approved, NotRated } = selectedCertificate;
	const { Action, Adventure, Animation, Biography, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Musical, Mystery, Romance, SciFi, Sports, Thriller, War, Western } = selectedGenre;

	const [filterData, setFilterData] = useState<any>(null);
	const [movieData, setMovieData] = useState<any>(null);
	const [movieDetail, setMovieDetail] = useState<any>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchInput(e.target.value);
	};

	const handleCertChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = event.target;
		setSelectedCertificate(prevState => ({
			...prevState,
			[name]: checked,
		}));
	};

	const handleGenreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = event.target;
		setSelectedGenre(prevState => ({
			...prevState,
			[name]: checked,
		}));
	};

	const handleRatingChange = (event: Event, newValue: number | number[]) => {
		setSelectedRating(newValue as number[]);
	};

	const handleRuntimeChange = (event: Event, newValue: number | number[]) => {
		setSelectedRuntime(newValue as number[]);
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
			selectedRating,
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

	const resetFilters = () => {
		setIsLoading(false);
		setOpen(false);
		setClicked(false);
		setSearchInput('');
		setFilterData(null);
		setMovieData(null);
		setMovieDetail(null);
		setSelectedCertificate({ G: true, PG: true, PG13: true, PG14: true, TV14: true, R: true, TVMA: true, Approved: true, NotRated: true });
		setSelectedGenre({ Action: true, Adventure: true, Animation: true, Biography: true, Comedy: true, Crime: true, Documentary: true, Drama: true, Family: true, Fantasy: true, History: true, Horror: true, Musical: true, Mystery: true, Romance: true, SciFi: true, Sports: true, Thriller: true, War: true, Western: true });
		setSelectedRating([0, 10]);
		setSelectedRuntime([30, 240]);
		setSelectedYear([1915, 2024]);
		handleSearchSubmit();
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
								{filterData && filterData['insights'] !== '' ? (
								<><CheckCircleIcon/> Finished generating recommends!</>
								) : (
								<><CheckCircleIcon/> No user query found!</>
								)}
							</span>
						)}
						</AccordionSummary>

						<AccordionDetails className='accordion_details_container'>
						{(!isLoading && filterData && filterData['insights'] !== '') ? (
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

					<Grid container spacing={2}>
						<Grid className='button_container' item xs={12} sm={12} md={6} lg={6} xl={6}>
							<Button variant="contained" startIcon={<RestartAltIcon />} onClick={resetFilters}>
								RESET
							</Button>
						</Grid>
						<Grid className='button_container' item xs={12} sm={12} md={6} lg={6} xl={6}>
							<Button variant="contained" startIcon={<DoneOutlineIcon />} onClick={handleSearchSubmit}>
								APPLY FILTERS
							</Button>
						</Grid>
					</Grid>

					<Accordion className='accordion_container'>
						<AccordionSummary
						expandIcon={<ArrowDropDownIcon />}
						aria-controls="panel2-content"
						id="panel2-header"
						>
						Content Rating
						</AccordionSummary>
						<AccordionDetails>
							<FormControl
								component="fieldset"
								sx={{ m: 3 }}
								variant="standard"
							>
								<FormGroup className='select_form_group'>
									<FormControlLabel
										control={
										<Checkbox checked={G} onChange={handleCertChange} name="G" />
										}
										label="G"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={PG} onChange={handleCertChange} name="PG" />
										}
										label="PG"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={PG13} onChange={handleCertChange} name="PG13" />
										}
										label="PG-13"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={PG14} onChange={handleCertChange} name="PG14" />
										}
										label="PG-14"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={TV14} onChange={handleCertChange} name="TV14" />
										}
										label="TV-14"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={R} onChange={handleCertChange} name="R" />
										}
										label="R"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={TVMA} onChange={handleCertChange} name="TVMA" />
										}
										label="TV-MA"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Approved} onChange={handleCertChange} name="Approved" />
										}
										label="Approved"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={NotRated} onChange={handleCertChange} name="NotRated" />
										}
										label="Not Rated"
									/>
								</FormGroup>
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
							<FormControl
								component="fieldset"
								sx={{ m: 3 }}
								variant="standard"
							>
								<FormGroup className='select_form_group'>
									<FormControlLabel
										control={
										<Checkbox checked={Action} onChange={handleGenreChange} name="Action" />
										}
										label="Action"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Adventure} onChange={handleGenreChange} name="Adventure" />
										}
										label="Adventure"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Animation} onChange={handleGenreChange} name="Animation" />
										}
										label="Animation"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Biography} onChange={handleGenreChange} name="Biography" />
										}
										label="Biography"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Comedy} onChange={handleGenreChange} name="Comedy" />
										}
										label="Comedy"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Crime} onChange={handleGenreChange} name="Crime" />
										}
										label="Crime"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Documentary} onChange={handleGenreChange} name="Documentary" />
										}
										label="Documentary"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Drama} onChange={handleGenreChange} name="Drama" />
										}
										label="Drama"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Family} onChange={handleGenreChange} name="Family" />
										}
										label="Family"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Fantasy} onChange={handleGenreChange} name="Fantasy" />
										}
										label="Fantasy"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={History} onChange={handleGenreChange} name="History" />
										}
										label="History"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Horror} onChange={handleGenreChange} name="Horror" />
										}
										label="Horror"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Musical} onChange={handleGenreChange} name="Musical" />
										}
										label="Musical"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Mystery} onChange={handleGenreChange} name="Mystery" />
										}
										label="Mystery"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Romance} onChange={handleGenreChange} name="Romance" />
										}
										label="Romance"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={SciFi} onChange={handleGenreChange} name="SciFi" />
										}
										label="SciFi"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Sports} onChange={handleGenreChange} name="Sports" />
										}
										label="Sports"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Thriller} onChange={handleGenreChange} name="Thriller" />
										}
										label="Thriller"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={War} onChange={handleGenreChange} name="War" />
										}
										label="War"
									/>
									<FormControlLabel
										control={
										<Checkbox checked={Western} onChange={handleGenreChange} name="Western" />
										}
										label="Western"
									/>
								</FormGroup>
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
							<Slider
								getAriaLabel={() => 'Rating range'}
								value={selectedRating}
								onChange={handleRatingChange}
								valueLabelDisplay="auto"
								shiftStep={1}
								step={1}
								marks
								min={0}
								max={10}
							/>
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
							<Slider
								getAriaLabel={() => 'Runtime range'}
								value={selectedRuntime}
								onChange={handleRuntimeChange}
								getAriaValueText={runtimeFormat}
								valueLabelDisplay="auto"
								shiftStep={10}
								step={10}
								marks
								min={30}
								max={240}
							/>
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
  
export default Home;