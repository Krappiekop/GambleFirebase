// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebase';
import { collection, addDoc, doc, getDoc, setDoc, query, onSnapshot, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import VideoPlayer from './VideoPlayer';
import VideoSelect from './VideoSelect';
import { Button, TextField, List, ListItem, ListItemText, Typography, Container, Box } from '@mui/material';

function Dashboard() {
  const [bet, setBet] = useState('');
  const [videoId, setVideoId] = useState('');
  const [bets, setBets] = useState([]);
  const [balance, setBalance] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login'); // Redirect to login if user is not authenticated
    } else {
      loadUserData();
      loadVideoId();
      loadBets();
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

  const loadVideoId = async () => {
    try {
      const docRef = doc(firestore, 'settings', 'currentVideo');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVideoId(docSnap.data().videoId);
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching video ID:', error);
    }
  };

  const loadBets = () => {
    const q = query(collection(firestore, 'bets'));
    onSnapshot(q, (querySnapshot) => {
      const betsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBets(betsArray);
    });
  };

  const handleBetSubmit = async (e) => {
    e.preventDefault();
    const betAmount = parseFloat(bet);
    if (isNaN(betAmount) || betAmount <= 0) {
      alert('Please enter a valid bet amount.');
      return;
    }
    if (betAmount > balance) {
      alert('Insufficient balance.');
      return;
    }
    try {
      await addDoc(collection(firestore, 'bets'), {
        bet: betAmount,
        userId: auth.currentUser.uid,
        displayName: displayName,
        timestamp: new Date()
      });
      await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
        balance: balance - betAmount
      });
      setBalance(balance - betAmount);
      setBet('');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const handleClearBets = async () => {
    try {
      const betsQuery = await getDocs(collection(firestore, 'bets'));
      betsQuery.forEach(async (betDoc) => {
        await deleteDoc(doc(firestore, 'bets', betDoc.id));
      });
      setBets([]);
    } catch (e) {
      console.error('Error clearing bets: ', e);
    }
  };

  const handleVideoSelect = async (videoId) => {
    setVideoId(videoId);
    try {
      await setDoc(doc(firestore, 'settings', 'currentVideo'), { videoId });
      console.log('Current video updated');
    } catch (error) {
      console.error('Error updating current video:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom>Dashboard</Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Button variant="contained" color="primary" onClick={handleLogout} sx={{ mr: 1 }}>Logout</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate('/profile')}>Profile</Button>
        </Box>
      </Box>
      <VideoSelect onSelect={handleVideoSelect} />
      {videoId && <VideoPlayer videoId={videoId} />}
      <Typography variant="h5" gutterBottom mt={2}>Balance: ${balance}</Typography>
      <form onSubmit={handleBetSubmit}>
        <TextField
          label="Place your bet"
          variant="outlined"
          fullWidth
          value={bet}
          onChange={(e) => setBet(e.target.value)}
          margin="normal"
        />
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Button type="submit" variant="contained" color="primary">Submit Bet</Button>
          <Button variant="contained" color="secondary" onClick={handleClearBets}>Clear Bets</Button>
        </Box>
      </form>
      <Typography variant="h4" gutterBottom mt={4}>Submitted Bets</Typography>
      <List>
        {bets.map(bet => (
          <ListItem key={bet.id}>
            <ListItemText primary={`${bet.displayName}: $${bet.bet}`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default Dashboard;
