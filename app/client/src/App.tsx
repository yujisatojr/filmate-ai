import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Home, { HomeHandles } from "./components/Home";
import Logo from './assets/images/logo.png';
import './App.scss';
import {withAuthInfo, useLogoutFunction, useRedirectFunctions} from '@propelauth/react';

// Import MUI components
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// import RedditIcon from '@mui/icons-material/Reddit';
// import YouTubeIcon from '@mui/icons-material/YouTube';
// import XIcon from '@mui/icons-material/X';

function App({isLoggedIn, user}: any)  {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const logoutFn = useLogoutFunction()
  const {redirectToSignupPage, redirectToLoginPage, redirectToAccountPage} = useRedirectFunctions()

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

  const homeRef = useRef<HomeHandles>(null);

  const handleMyListClick = () => {
    if (homeRef.current) {
      homeRef.current.handleMyListClick();
    }
  };

  const handleResetFiltersClick = () => {
    if (homeRef.current) {
      homeRef.current.resetFilters();
    }
  };

  const handleExploreClick = () => {
    if (homeRef.current) {
      homeRef.current.handleExploreClick();
    }
  };

  return (
  <Router>
    <AppBar className='navi-bar' position="static">
      <Container maxWidth="xl" className='main_app_container'>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
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
            <img className='logo_img' src={Logo} alt='logo'/>
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
              <MenuItem onClick={() => {handleCloseNavMenu(); handleResetFiltersClick();}}>
                <Typography textAlign="center">Home</Typography>
              </MenuItem>
              <MenuItem onClick={() => {handleCloseNavMenu(); isLoggedIn ? handleMyListClick() : redirectToLoginPage();}}>
                <Typography textAlign="center">My List</Typography>
              </MenuItem>
              <MenuItem onClick={() => {handleCloseNavMenu(); isLoggedIn ? handleExploreClick() : redirectToLoginPage();}}>
                <Typography textAlign="center">Explore</Typography>
              </MenuItem>
              <MenuItem>
                <Typography textAlign="center">Help</Typography>
              </MenuItem>
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
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
            <img className='logo_img' src={Logo} alt='logo'/>
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {/* <Button
              className='nav_button_link'
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              My List
            </Button>
            <Button
              className='nav_button_link'
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Explore
            </Button> */}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              {(isLoggedIn && user) ? (
                <IconButton className='navbar-avatar' onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <img className='image_circle' alt={user.username} src={user.pictureUrl}/>
                </IconButton>
              ) : (
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="John Doe" />
                </IconButton>
              )}
            </Tooltip>
            {isLoggedIn? (
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
                <MenuItem onClick={() => {
                  handleCloseUserMenu();
                  redirectToAccountPage();
                }}>
                  <Typography textAlign="center">Account</Typography>
                </MenuItem>
                <MenuItem onClick={() => {
                  logoutFn(true);
                  handleCloseUserMenu();
                  }} component={NavLink} to="/">
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
          ) : (
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
                <MenuItem onClick={() => {
                  handleCloseUserMenu();
                  redirectToSignupPage();
                }}>
                  <Typography textAlign="center">Sign Up</Typography>
                </MenuItem>
                <MenuItem onClick={() => {
                  handleCloseUserMenu();
                  redirectToLoginPage();
                }}>
                  <Typography textAlign="center">Login</Typography>
                </MenuItem>
            </Menu>
          )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>

      <Routes>
        <Route path="/" element={<Home ref={homeRef} isLoggedIn={isLoggedIn} user={user} />} />
        {/* <Route path="/mylist" element={<MyList />} />
        <Route path="/explore" element={<Explore />} /> */}
      </Routes>

    {/* <footer>
      <div className="social_links">
        <a href="/" target="_blank" rel="noreferrer"><RedditIcon/></a>
        <a href="/" target="_blank" rel="noreferrer"><YouTubeIcon/></a>
        <a href="/" target="_blank" rel="noreferrer"><XIcon/></a>
      </div>

      <div className="footer-copyright">
          <p>© 2024 Filmate AI</p>
      </div>
    </footer> */}
  </Router>
  );
}

export default  withAuthInfo(App);