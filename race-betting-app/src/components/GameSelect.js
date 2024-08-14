import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { Button, Container, Typography, Box, IconButton, Grid, Divider } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Leaderboard from './Leaderboard'; // importeer het leaderboard component
import chestImage from './assets/chest_closed_NoBG.png'; // Import the chest image
import wheelfortune from './assets/Wheel_of_Fortune.png'; // Import the wheelfortune image
import guessthenumber from './assets/GuessTheNumber.png'; // Import the guessthenumber image

function GameSelection() {
  const [balance, setBalance] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
    } else {
      loadUserData();
    }
  }, [navigate]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setBalance(userData.balance);
        setDisplayName(userData.displayName);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={4}>
        <Typography variant="h4">Welcome, {displayName}</Typography>
        <Box display="flex" alignItems="center">
          <Typography variant="h6" style={{ marginRight: '20px' }}>${balance}</Typography>
          <IconButton onClick={() => navigate('/profile')}>
            <AccountCircleIcon />
          </IconButton>
          <Button variant="contained" color="primary" onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</Button>
        </Box>
      </Box>
      
      <Divider style={{ marginBottom: '20px' }} />

      {/* Daily Category */}
      <Typography variant="h5" gutterBottom>Daily</Typography>
      <Divider style={{ marginBottom: '10px' }} />
      <Grid container spacing={3} justifyContent="flex-start">
        <Grid item xs={12} sm={6} md={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/daily-cash')}
            style={{
              width: '100%',
              height: '150px',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px',
              position: 'relative',
              backgroundColor: '#1E88E5',
              backgroundImage: `url(${chestImage})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: '50%',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
              color: '#FFFFFF'
            }}
          >
            <span style={{ position: 'absolute', bottom: '10px', right: '10px' }}>DAILY CHEST</span>
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
        <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/free-spin')}
            style={{
              width: '100%',
              height: '150px',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px',
              position: 'relative',
              backgroundColor: '#1E88E5',
              backgroundImage: `url(${wheelfortune})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: '50%',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
              color: '#FFFFFF'
            }}
          >
            <span style={{ position: 'absolute', bottom: '10px', right: '10px' }}>FREE SPIN</span>
          </Button>
        </Grid>
      </Grid>

      {/* Casino Category */}
      <Typography variant="h5" gutterBottom mt={4}>Casino</Typography>
      <Divider style={{ marginBottom: '10px' }} />
      <Grid container spacing={3} justifyContent="flex-start">
        <Grid item xs={12} sm={6} md={4}>
        <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/guess-the-number')}
            style={{
              width: '100%',
              height: '150px',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px',
              position: 'relative',
              backgroundColor: '#1E88E5',
              backgroundImage: `url(${guessthenumber})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: '50%',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
              color: '#FFFFFF'
            }}
          >
            <span style={{ position: 'absolute', bottom: '10px', right: '10px' }}>GUESS THE NUMBER</span>
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            variant="contained"
            color="primary"
            style={{
              width: '100%',
              height: '150px',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              padding: '10px'
            }}
          >
            ROULETTE
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            variant="contained"
            color="primary"
            style={{
              width: '100%',
              height: '150px',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              padding: '10px'
            }}
          >
            HIGHER OR LOWER
          </Button>
        </Grid>
      </Grid>

      {/* Race Category */}
      <Typography variant="h5" gutterBottom mt={4}>Race</Typography>
      <Divider style={{ marginBottom: '10px' }} />
      <Grid container spacing={3} justifyContent="flex-start">
        <Grid item xs={12} sm={6} md={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%',
              height: '150px',
              backgroundImage: 'url(/path_to_marble_race_image.jpg)',
              backgroundSize: 'cover',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              padding: '10px'
            }}
          >
            MARBLE RACE
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            variant="contained"
            color="primary"
            style={{
              width: '100%',
              height: '150px',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              padding: '10px'
            }}
          >
            PAARDENRACE
          </Button>
        </Grid>
      </Grid>

      {/* Card Games Category */}
      <Typography variant="h5" gutterBottom mt={4}>Card Games</Typography>
      <Divider style={{ marginBottom: '10px' }} />
      <Grid container spacing={3} justifyContent="flex-start" style={{ marginBottom: '40px' }}>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            variant="contained"
            color="primary"
            style={{
              width: '100%',
              height: '150px',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              padding: '10px'
            }}
          >
            UNO
          </Button>
        </Grid>
      </Grid>

      <Leaderboard drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} /> {/* Gebruik het Leaderboard component */}
    </Container>
  );
}

export default GameSelection;
