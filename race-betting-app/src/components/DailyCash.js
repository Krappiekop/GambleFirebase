import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { getDoc, updateDoc, doc } from 'firebase/firestore';
import { Container, Typography, Button, IconButton, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import Leaderboard from './Leaderboard';
import chestClosed from './assets/chest_closed.png';
import chestOpen from './assets/chest_open.png';
import './DailyCash.css'; // Import the CSS file

function DailyCash() {
  const [balance, setBalance] = useState(0);
  const [isOpened, setIsOpened] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [showCoins, setShowCoins] = useState(false); // State to handle coin animation
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setBalance(userData.balance);

        const lastOpened = userData.lastChestOpened?.toMillis() || 0;
        const currentTime = Date.now();
        const timeElapsed = Math.floor((currentTime - lastOpened) / 1000);

        if (timeElapsed < 600) { // 600 seconds = 10 minutes
          setCooldown(600 - timeElapsed);
          setIsOpened(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
    } else {
      loadUserData();
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prevCooldown) => prevCooldown - 1);
      }, 1000);
    } else {
      setIsOpened(false);
    }

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOpenChest = async () => {
    try {
      const reward = calculateReward();
      const newBalance = balance + reward;
      setBalance(newBalance);
      setIsOpened(true);
      setCooldown(10); // Set cooldown to 10 minutes (600 seconds) - Change to 10800 for 3 hours
      setRewardAmount(reward);
      setShowCoins(true); // Show coins animation

      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { 
        balance: newBalance,
        lastChestOpened: new Date()
      });

      setShowSnackbar(true);
      
      // Hide coins after animation ends
      setTimeout(() => {
        setShowCoins(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error opening chest:', error);
    }
  };

  const calculateReward = () => {
    const random = Math.random() * 100;
    if (random <= 5) return 500;
    if (random <= 15) return 250;
    if (random <= 30) return 150;
    if (random <= 55) return 100;
    return 50;
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <Container style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', position: 'relative', paddingBottom: '40px' }}>
      <Leaderboard />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '20px' }}>
        <ArrowBackIcon onClick={() => navigate('/games')} style={{ cursor: 'pointer' }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/profile')}>
            <AccountCircleIcon />
          </IconButton>
          <Button variant="contained" color="primary" onClick={handleLogout} style={{ marginLeft: '10px' }}>
            Logout
          </Button>
        </div>
      </div>
      <Typography variant="h3" gutterBottom>
        Daily Chest
      </Typography>
      <div style={{ borderBottom: '2px solid #ccc', marginBottom: '20px' }}></div>
      <div className="coin-container">
        <img src={isOpened ? chestOpen : chestClosed} alt="Chest" style={{ width: '200px', marginBottom: '20px' }} />
        {showCoins && (
          <>
            <div className="coin" style={{ left: '30%' }}></div>
            <div className="coin" style={{ left: '50%' }}></div>
            <div className="coin" style={{ left: '70%' }}></div>
          </>
        )}
      </div>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '30px' }}>
        ${balance}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenChest}
        disabled={isOpened}
      >
        {cooldown > 0 ? `Wait ${cooldown}s` : 'Open Daily Chest'}
      </Button>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%', backgroundColor: '#4caf50', color: '#fff' }}
          action={
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          ${rewardAmount} has been added to your balance!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default DailyCash;
