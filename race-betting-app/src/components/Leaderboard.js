// Leaderboard.js
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { query, collection, onSnapshot, orderBy } from 'firebase/firestore';
import { Drawer, IconButton, Typography, List, Card, CardContent } from '@mui/material';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import CloseIcon from '@mui/icons-material/Close';

function Leaderboard() {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    const q = query(collection(firestore, 'users'), orderBy('balance', 'desc'));
    onSnapshot(q, (querySnapshot) => {
      const leaderboardArray = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        displayName: doc.data().displayName,
        balance: doc.data().balance,
        rank: index + 1
      })).slice(0, 10); // Top 10 players
      setLeaderboard(leaderboardArray);
    });
  };

  const toggleLeaderboard = () => {
    setIsLeaderboardOpen(!isLeaderboardOpen);
  };

  return (
    <>
      <IconButton
        onClick={toggleLeaderboard}
        style={{ position: 'fixed', top: 20, right: 20 }}
        color="primary"
      >
        <LeaderboardIcon />
      </IconButton>

      <Drawer anchor="right" open={isLeaderboardOpen} onClose={toggleLeaderboard}>
        <div style={{ width: '300px', padding: '20px' }}>
          <IconButton onClick={toggleLeaderboard} style={{ float: 'right' }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" gutterBottom>Leaderboard</Typography>
          <List>
            {leaderboard.map(player => (
              <Card key={player.id} style={{ marginBottom: '10px' }}>
                <CardContent>
                  <Typography variant="body1">
                    {player.rank}. {player.displayName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Balance: ${player.balance.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </List>
        </div>
      </Drawer>
    </>
  );
}

export default Leaderboard;
