import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { getDoc, updateDoc, doc, addDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Container, Typography, Button, IconButton, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import Leaderboard from './Leaderboard';
import chestClosed from './assets/chest_closed.png';
import chestOpen from './assets/chest_open.png';
import DailyCashLog from './DailyCashLog';
import './DailyCash.css';

function DailyCash() {
  const [balance, setBalance] = useState(0);
  const [isOpened, setIsOpened] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [showCoins, setShowCoins] = useState(false); 
  const [rounds, setRounds] = useState([]); // Log data
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
    } else {
      loadUserData();
      fetchRounds();
    }
  }, [navigate]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setBalance(userData.balance);

        const lastOpened = userData.lastChestOpened?.toMillis() || 0;
        const currentTime = Date.now();
        const timeElapsed = Math.floor((currentTime - lastOpened) / 1000);

        if (timeElapsed < 43200) { // 12 uur in seconden
          setCooldown(43200 - timeElapsed);
          setIsOpened(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchRounds = () => {
    const roundsQuery = query(
      collection(firestore, 'dailyCashRounds'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    onSnapshot(roundsQuery, (snapshot) => {
      const roundsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRounds(roundsData);
    });
  };

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
      setCooldown(43200); // 12 uur in seconden
      setRewardAmount(reward);
      setShowCoins(true); 

      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { 
        balance: newBalance,
        lastChestOpened: new Date()
      });

      const user = auth.currentUser;
      let displayName = user.displayName;

      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        displayName = userDoc.data().displayName || displayName;
      }

      await addDoc(collection(firestore, 'dailyCashRounds'), {
        rewardAmount: reward,
        displayName: displayName || 'Anonymous',
        timestamp: new Date()
      });

      setShowSnackbar(true);
      
      setTimeout(() => {
        setShowCoins(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error opening chest or logging reward:', error);
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
      <DailyCashLog rounds={rounds} />
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
       <img src={isOpened ? chestOpen : chestClosed} alt="Chest" style={{ width: '300px', marginBottom: '20px' }} />
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
        style={{ fontSize: '1.2rem', padding: '10px 20px' }}
      >
        {cooldown > 0 ? `Wait ${Math.floor(cooldown / 3600)}h ${Math.floor((cooldown % 3600) / 60)}m` : 'Open Daily Chest'}
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
