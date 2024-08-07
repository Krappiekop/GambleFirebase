// src/components/GameSelection.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { Button, Container, Typography, Box } from '@mui/material';

function GameSelection() {
  const [balance, setBalance] = useState(0);
  const [displayName, setDisplayName] = useState('');
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

  return (
    <Container>
      <Typography variant="h3" gutterBottom>Welcome, {displayName}</Typography>
      <Typography variant="h5" gutterBottom>Balance: ${balance}</Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button variant="contained" color="primary" onClick={handleLogout}>Logout</Button>
        <Button variant="contained" color="secondary" onClick={() => navigate('/profile')}>Profile</Button>
      </Box>
      <Typography variant="h4" gutterBottom>Select a Game</Typography>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')} style={{ marginBottom: '10px' }}>
          Race Betting
        </Button>
        {/* Voeg hier andere spellen toe */}
        {/* <Button variant="contained" color="primary" onClick={() => navigate('/another-game')} style={{ marginBottom: '10px' }}>
          Another Game
        </Button> */}
      </Box>
    </Container>
  );
}

export default GameSelection;
