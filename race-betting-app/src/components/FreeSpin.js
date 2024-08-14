import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { getDoc, doc, updateDoc, addDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Container, Typography, Button, IconButton, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import Leaderboard from './Leaderboard';
import FreeSpinLog from './FreeSpinLog';
import './FreeSpin.css';
import wheelImage from './assets/wheel.png';

function FreeSpin() {
  const [balance, setBalance] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [rounds, setRounds] = useState([]);
  const navigate = useNavigate();

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
        setBalance(userDoc.data().balance);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchRounds = () => {
    const roundsQuery = query(
      collection(firestore, 'freeSpinRounds'),
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const prizes = [
      { name: "$2000", angle: 0, probability: 0.01 },
      { name: "$1250", angle: 45, probability: 0.02 },
      { name: "$750", angle: 90, probability: 0.05 },
      { name: "$500", angle: 135, probability: 0.07 },
      { name: "$200", angle: 180, probability: 0.10 },
      { name: "$100", angle: 225, probability: 0.15 },
      { name: "$50", angle: 270, probability: 0.25 },
      { name: "$20", angle: 315, probability: 0.35 },
    ];

    const prize = getRandomPrize(prizes);
    const finalAngle = 360 * 5 + prize.angle; 
    setRotation(finalAngle);

    setTimeout(async () => {
      setIsSpinning(false);
      const prizeAmount = parseInt(prize.name.replace('$', ''));
    
      try {
        const user = auth.currentUser;
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        let displayName = user.displayName;

        if (userDoc.exists()) {
          displayName = userDoc.data().displayName || displayName;
        }

        await updateDoc(userDocRef, {
          balance: balance + prizeAmount
        });
        setBalance(balance + prizeAmount);
    
        setSnackbarMessage(`${prize.name} added to your balance!`);
        setShowSnackbar(true);
    
        await addDoc(collection(firestore, 'freeSpinRounds'), {
          prize: prize.name,
          displayName: displayName || 'Anonymous',
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error updating balance or logging spin:', error);
      }
    }, 5000);
  };

  const getRandomPrize = (prizes) => {
    const random = Math.random();
    let accumulatedProbability = 0;

    for (const prize of prizes) {
      accumulatedProbability += prize.probability;
      if (random <= accumulatedProbability) {
        return prize;
      }
    }
    return prizes[prizes.length - 1];
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <Container style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', position: 'relative', paddingBottom: '40px' }}>
      <FreeSpinLog rounds={rounds} />
      <Leaderboard />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '20px' }}>
        <ArrowBackIcon onClick={() => navigate('/games')} style={{ cursor: 'pointer' }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/profile')}>
            <AccountCircleIcon />
          </IconButton>
          <Button variant="contained" color="primary" onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</Button>
        </div>
      </div>
      <Typography variant="h3" gutterBottom style={{ marginTop: '20px' }}>
        Free Spin
      </Typography>
      <div style={{ borderBottom: '2px solid #ccc', marginBottom: '20px' }}></div>
      <div className="wheel-container">
        <img
          src={wheelImage}
          alt="Wheel"
          className={`wheel ${isSpinning ? 'spinning' : ''}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </div>
      <Typography variant="h5" gutterBottom style={{ margin: '20px 0' }}>${balance}</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSpin}
        fullWidth
        disabled={isSpinning}
      >
        Use Free Spin
      </Button>
      <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
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
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default FreeSpin;
