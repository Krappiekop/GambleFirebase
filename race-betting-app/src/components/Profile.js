import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button, Container, TextField, Typography, Box, Card, CardContent, Grid, Tabs, Tab, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Profile() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');  // For updating password
  const [balance, setBalance] = useState('$0.00'); // State to store balance
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [stats, setStats] = useState(null);
  const [tabValue, setTabValue] = useState(0);
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
      setBalance(`$${userData.balance.toFixed(2)}`);
    }

    // Fetch statistics for GuessTheNumber and DailyCash
    const statsDoc = await getDoc(doc(firestore, 'users', user.uid, 'stats', 'guessTheNumber'));
    const dailyCashStatsDoc = await getDoc(doc(firestore, 'users', user.uid, 'stats', 'dailyCash'));
    let statsData = {};
    if (statsDoc.exists()) {
      statsData.guessTheNumber = statsDoc.data();
    }
    if (dailyCashStatsDoc.exists()) {
      statsData.dailyCash = dailyCashStatsDoc.data();
    }
    setStats(statsData);
  };

  const handleUpdateProfile = async () => {
    try {
      const user = auth.currentUser;
      await updateDoc(doc(firestore, 'users', user.uid), {
        displayName: displayName
        // Email and password updates would require additional handling and verification.
      });
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '20px' }}>
        <ArrowBackIcon onClick={() => navigate('/games')} style={{ cursor: 'pointer' }} />
        <Typography variant="h3" gutterBottom align="center" style={{ flexGrow: 1 }}>
          Profile
        </Typography>
      </div>

      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Account" />
        <Tab label="Statistics" />
      </Tabs>

      {tabValue === 0 && (
        <Box mt={3}>
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
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            type="password"
            placeholder="Enter new password"
          />
          <TextField
            label="Balance"
            variant="outlined"
            fullWidth
            value={balance}
            margin="normal"
            disabled
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateProfile}
            fullWidth
          >
            Update Profile
          </Button>
        </Box>
      )}

      {tabValue === 1 && stats && (
        <Box mt={3}>
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>Daily</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>Daily Cash</Typography>
                    <Typography variant="h4">${stats.dailyCash?.totalCollected || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>Total Chests Opened</Typography>
                    <Typography variant="h4">{stats.dailyCash?.totalChestsOpened || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Box mt={2}>
            <Typography variant="h6" gutterBottom>Casino</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>Total Games Played</Typography>
                    <Typography variant="h4">{stats.guessTheNumber?.gamesPlayed || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>Total Bet Amount</Typography>
                    <Typography variant="h4">${stats.guessTheNumber?.totalBet || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>Total Wins</Typography>
                    <Typography variant="h4">{stats.guessTheNumber?.totalWins || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>Total Losses</Typography>
                    <Typography variant="h4">{stats.guessTheNumber?.totalLosses || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default Profile;
