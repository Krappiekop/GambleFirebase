import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { getDoc, doc, updateDoc, collection, addDoc, query, onSnapshot, orderBy, setDoc } from 'firebase/firestore';
import { Container, Typography, Button, Grid, IconButton, Snackbar, Alert } from '@mui/material';
import ChipSelection from './ChipSelection';
import Leaderboard from './Leaderboard'; // Import the new Leaderboard component
import Log from './GuessthenumberLog'; // Import the new Log component
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';

function GuessTheNumber() {
  const [balance, setBalance] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState({});
  const [selectedChip, setSelectedChip] = useState(null);
  const [lastBet, setLastBet] = useState({});
  const [rounds, setRounds] = useState([]);
  const [randomNumber, setRandomNumber] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
    } else {
      loadUserData();
      loadRounds();
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  const loadRounds = () => {
    const q = query(collection(firestore, 'guessTheNumberRounds'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (querySnapshot) => {
      const roundsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRounds(roundsArray);
    });
  };

  const handleNumberSelect = (number) => {
    if (!selectedChip) {
      alert('Please select a chip value first');
      return;
    }

    if (balance < selectedChip) {
      alert('Not enough balance');
      return;
    }

    setSelectedNumbers(prevState => ({
      ...prevState,
      [number]: (prevState[number] || 0) + selectedChip
    }));

    setBalance(prevBalance => prevBalance - selectedChip);
  };

  const handleLastBet = () => {
    if (Object.keys(lastBet).length === 0) {
      alert('No last bet available');
      return;
    }

    const totalLastBet = Object.values(lastBet).reduce((sum, bet) => sum + bet, 0);
    if (balance < totalLastBet) {
      alert('Not enough balance for the last bet');
      return;
    }

    setSelectedNumbers(lastBet);
    setBalance(prevBalance => prevBalance - totalLastBet);
  };

  const handleClearBets = () => {
    const totalBet = Object.values(selectedNumbers).reduce((sum, bet) => sum + bet, 0);
    setBalance(prevBalance => prevBalance + totalBet);
    setSelectedNumbers({});
  };

  const handleStartRound = async () => {
    setIsAnimating(true);
    let animationCount = 0;
    const animationInterval = setInterval(() => {
      setRandomNumber(Math.floor(Math.random() * 10) + 1);
      animationCount++;
      if (animationCount > 20) {
        clearInterval(animationInterval);
        revealWinningNumber();
      }
    }, 100);
  };

  const revealWinningNumber = async () => {
    const generatedNumber = Math.floor(Math.random() * 10) + 1;
    setRandomNumber(generatedNumber);
    setIsAnimating(false);

    let totalPayout = 0;
    let totalBet = 0;
    let betNumbers = [];

    Object.keys(selectedNumbers).forEach(number => {
      const betAmount = selectedNumbers[number] || 0;
      totalBet += betAmount;
      if (betAmount > 0) {
        betNumbers.push(number);
        if (parseInt(number) === generatedNumber) {
          totalPayout += betAmount * 10;
        } else if (
          Math.abs(parseInt(number) - generatedNumber) === 1 ||
          (number === '1' && generatedNumber === 10) ||
          (number === '10' && generatedNumber === 1)
        ) {
          totalPayout += betAmount * 3;
        }
      }
    });

    const netPayout = totalPayout;

    try {
      const user = auth.currentUser;
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      let displayName = user.displayName;
      if (userDoc.exists()) {
        displayName = userDoc.data().displayName || displayName;

        const statsRef = doc(firestore, 'users', user.uid, 'stats', 'guessTheNumber');
        const statsDoc = await getDoc(statsRef);
        if (statsDoc.exists()) {
          const statsData = statsDoc.data();
          await updateDoc(statsRef, {
            gamesPlayed: statsData.gamesPlayed + 1,
            totalBet: statsData.totalBet + totalBet,
            totalWins: statsData.totalWins + (netPayout > totalBet ? 1 : 0),
            totalLosses: statsData.totalLosses + (netPayout <= totalBet ? 1 : 0),
          });
        } else {
          await setDoc(statsRef, {
            gamesPlayed: 1,
            totalBet: totalBet,
            totalWins: netPayout > totalBet ? 1 : 0,
            totalLosses: netPayout <= totalBet ? 1 : 0,
          });
        }
      }

      await addDoc(collection(firestore, 'guessTheNumberRounds'), {
        generatedNumber,
        displayName: displayName,
        betAmount: totalBet,
        payout: netPayout - totalBet,
        betNumbers: betNumbers.join(', '),
        timestamp: new Date()
      });

      await updateDoc(userDocRef, {
        balance: balance + netPayout
      });

      setBalance(balance + netPayout);
      setLastBet(selectedNumbers);
      setSelectedNumbers({});

      // Show the Snackbar with the result
      setSnackbarSeverity(netPayout >= totalBet ? 'success' : 'error');
      setSnackbarMessage(
        `${new Date().toLocaleTimeString()} - Bet: $${totalBet} on ${betNumbers.join(', ')} - Winning Number: ${generatedNumber} - Profit: $${netPayout - totalBet}`
      );
      setShowSnackbar(true);

    } catch (error) {
      console.error('Error starting round: ', error);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <Container style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', position: 'relative', paddingBottom: '40px' }}>
      <Log rounds={rounds} />
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
        Guess the Number
      </Typography>
      <div style={{ borderBottom: '2px solid #ccc', marginBottom: '20px' }}></div>
      <Typography variant="h1" gutterBottom style={{ margin: '40px 0' }}>
        {randomNumber}
      </Typography>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '30px' }}>${balance}</Typography>
      <Grid container spacing={2} justifyContent="center" style={{ marginBottom: '20px' }}>
        <ChipSelection selectedChip={selectedChip} onSelectChip={setSelectedChip} />
      </Grid>
      <Grid container spacing={2} justifyContent="center">
        {Array.from({ length: 9 }, (_, index) => index + 1).map(number => (
          <Grid item xs={4} key={number}>
            <Button
              variant={selectedNumbers[number] ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleNumberSelect(number)}
              fullWidth
              disabled={isAnimating}
            >
              {number}
              {selectedNumbers[number] && <Typography variant="body2">(${selectedNumbers[number]})</Typography>}
            </Button>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            variant={selectedNumbers[10] ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => handleNumberSelect(10)}
            fullWidth
            disabled={isAnimating}
          >
            10
            {selectedNumbers[10] && <Typography variant="body2">(${selectedNumbers[10]})</Typography>}
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} justifyContent="center" style={{ marginTop: '20px' }}>
        <Grid item xs={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartRound}
            fullWidth
            disabled={isAnimating || Object.keys(selectedNumbers).length === 0}
          >
            Play
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLastBet}
            fullWidth
            disabled={isAnimating}
          >
            Last Bet
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearBets}
            fullWidth
            disabled={isAnimating}
          >
            Clear Bets
          </Button>
        </Grid>
      </Grid>
      <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%', backgroundColor: snackbarSeverity === 'success' ? '#4caf50' : '#f44336', color: '#fff' }}
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

export default GuessTheNumber;
