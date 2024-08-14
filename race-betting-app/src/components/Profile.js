// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button, Container, TextField, Typography, Box, Card, CardContent, Grid } from '@mui/material';

function Profile() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
    } else {
      loadUserData();
    }
  }, [navigate]);

  const loadUserData = async () => {
    const user = auth.currentUser;
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setEmail(userData.email);
      setDisplayName(userData.displayName);
    }

    // Fetch statistics for GuessTheNumber
    const statsDoc = await getDoc(doc(firestore, 'users', user.uid, 'stats', 'guessTheNumber'));
    if (statsDoc.exists()) {
      setStats(statsDoc.data());
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const user = auth.currentUser;
      await updateDoc(doc(firestore, 'users', user.uid), {
        displayName: displayName
      });
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" gutterBottom>Profile</Typography>

      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        value={email}
        margin="normal"
        disabled
      />
      <TextField
        label="Display Name"
        variant="outlined"
        fullWidth
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpdateProfile}
        fullWidth
      >
        Update Profile
      </Button>

      {stats && (
        <Box mt={5}>
          <Typography variant="h5" gutterBottom>Guess The Number Stats</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>Total Games Played</Typography>
                  <Typography variant="h4">{stats.gamesPlayed}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>Total Bet Amount</Typography>
                  <Typography variant="h4">${stats.totalBet}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>Total Wins</Typography>
                  <Typography variant="h4">{stats.totalWins}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>Total Losses</Typography>
                  <Typography variant="h4">{stats.totalLosses}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default Profile;
