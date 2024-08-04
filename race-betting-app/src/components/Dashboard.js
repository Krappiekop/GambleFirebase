// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebase';
import { collection, addDoc, doc, getDoc, setDoc, query, onSnapshot } from 'firebase/firestore';
import VideoPlayer from './VideoPlayer';
import VideoSelect from './VideoSelect';
import { Button, TextField, List, ListItem, ListItemText, Typography, Container } from '@mui/material';

function Dashboard() {
  const [bet, setBet] = useState('');
  const [videoId, setVideoId] = useState('');
  const [bets, setBets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login'); // Redirect to login if user is not authenticated
    } else {
      loadVideoId();
      loadBets();
    }
  }, [navigate]);

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
    try {
      const docRef = await addDoc(collection(firestore, 'bets'), {
        bet,
        userId: auth.currentUser.uid,
        timestamp: new Date()
      });
      console.log('Document written with ID: ', docRef.id);
      setBet('');
    } catch (e) {
      console.error('Error adding document: ', e);
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

  return (
    <Container>
      <Typography variant="h3" gutterBottom>Dashboard</Typography>
      <Button variant="contained" color="primary" onClick={() => auth.signOut()}>Logout</Button>
      <VideoSelect onSelect={handleVideoSelect} />
      {videoId && <VideoPlayer videoId={videoId} />}
      <form onSubmit={handleBetSubmit}>
        <TextField
          label="Place your bet"
          variant="outlined"
          fullWidth
          value={bet}
          onChange={(e) => setBet(e.target.value)}
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">Submit Bet</Button>
      </form>
      <Typography variant="h4" gutterBottom>Submitted Bets</Typography>
      <List>
        {bets.map(bet => (
          <ListItem key={bet.id}>
            <ListItemText primary={bet.bet} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default Dashboard;
