import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { Button, Container, Typography, Box, IconButton, Grid, Divider } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Leaderboard from './Leaderboard'; // importeer het leaderboard component

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Welcome, {displayName}</Typography>
        <Box display="flex" alignItems="center">
          <Typography variant="h6" style={{ marginRight: '20px' }}>Balance: ${balance.toFixed(2)}</Typography>
          <IconButton onClick={() => navigate('/profile')}>
            <AccountCircleIcon />
          </IconButton>
          <Button variant="contained" color="primary" onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</Button>
        </Box>
      </Box>
      
      <Divider style={{ marginBottom: '20px' }} />

      <Grid container spacing={3} justifyContent="center">
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
            onClick={() => navigate('/guess-the-number')}
            style={{
              width: '100%',
              height: '150px',
              backgroundImage: 'url(/path_to_guess_the_number_image.jpg)',
              backgroundSize: 'cover',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              padding: '10px'
            }}
          >
            GUESS THE NUMBER
          </Button>
        </Grid>
        {/* Hier kun je later meer spelopties toevoegen */}
      </Grid>

      <Leaderboard drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} /> {/* Gebruik het Leaderboard component */}
    </Container>
  );
}

export default GameSelection;
