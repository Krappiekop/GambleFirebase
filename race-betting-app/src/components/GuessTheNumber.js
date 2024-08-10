// src/components/GuessTheNumber.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { getDoc, doc, updateDoc, collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Container, Typography, Button, Grid, List, Card, CardContent } from '@mui/material';
import ChipSelection from './ChipSelection';
import moment from 'moment';

function GuessTheNumber() {
  const [balance, setBalance] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState({});
  const [selectedChip, setSelectedChip] = useState(null);
  const [lastBet, setLastBet] = useState({});
  const [rounds, setRounds] = useState([]);
  const [randomNumber, setRandomNumber] = useState(0);
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
    const generatedNumber = Math.floor(Math.random() * 10) + 1;
    setRandomNumber(generatedNumber);
    let totalPayout = 0;
    let totalBet = 0;
    let betNumbers = [];

    Object.keys(selectedNumbers).forEach(number => {
      const betAmount = selectedNumbers[number] || 0;
      totalBet += betAmount;
      if (betAmount > 0) {
        betNumbers.push(number);  // Voeg het nummer toe aan de betNumbers array
        if (parseInt(number) === generatedNumber) {
          totalPayout += betAmount * 10;
        } else if (
          Math.abs(parseInt(number) - generatedNumber) === 1 ||
          (number === '1' && generatedNumber === 10) ||
          (number === '10' && generatedNumber === 1)
        ) {
          totalPayout += betAmount * 3;
        } else {
          totalPayout -= betAmount;
        }
      }
    });

    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      let displayName = user.displayName;
      if (userDoc.exists()) {
        displayName = userDoc.data().displayName || displayName;
      }

      await addDoc(collection(firestore, 'guessTheNumberRounds'), {
        generatedNumber,
        displayName: displayName,
        betAmount: totalBet,
        payout: totalPayout,
        betNumbers: betNumbers.join(', '),  // Sla de nummers op als een string
        timestamp: new Date()
      });

      await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
        balance: balance + totalPayout
      });

      setBalance(balance + totalPayout);
      setLastBet(selectedNumbers);  // Sla de huidige inzet op als "last bet"
      setSelectedNumbers({});
    } catch (error) {
      console.error('Error starting round: ', error);
    }
  };

  return (
    <Container style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>Guess the Number</Typography>
      <Typography variant="h1" gutterBottom style={{ margin: '20px 0' }}>
        {randomNumber}
      </Typography>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '30px' }}>Balance: ${balance}</Typography>
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
            >
              {number}
              {selectedNumbers[number] && <Typography variant="body2">(${selectedNumbers[number]})</Typography>}
            </Button>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            variant={selectedNumbers[10] ? 'contained' : 'outlined'} // Kleur wijzigen afhankelijk van selectie
            color="primary"
            onClick={() => handleNumberSelect(10)}
            fullWidth
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
          >
            Clear Bets
          </Button>
        </Grid>
      </Grid>
      <Typography variant="h4" gutterBottom style={{ marginTop: '40px' }}>
        Last 10 Rounds
      </Typography>
      <List>
        {rounds.slice(0, 10).map(round => {
          const isPayoutPositive = round.payout >= 0;
          const payoutAmount = Math.abs(round.payout).toFixed(2);
          const payoutColor = isPayoutPositive ? 'green' : 'red';

          return (
            <Card key={round.id} variant="outlined" style={{ marginBottom: '10px' }}>
              <CardContent>
                <Typography variant="subtitle1" color="textSecondary">
                  {moment(round.timestamp.toDate()).format('MMMM Do YYYY, h:mm:ss a')}
                </Typography>
                <Typography variant="h6" component="div">
                  {round.displayName} - Winning Number: {round.generatedNumber} - Payout: 
                  <span style={{ color: payoutColor }}>
                   {' '} ${payoutAmount}
                  </span>
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Bet ${round.betAmount} on {round.betNumbers}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </List>

    </Container>
  );
}

export default GuessTheNumber;
