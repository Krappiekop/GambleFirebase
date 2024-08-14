import React, { useState } from 'react';
import { Drawer, IconButton, Typography, List, Card, CardContent } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';
import moment from 'moment';

function DailyCashLog({ rounds }) {
  const [isLogOpen, setIsLogOpen] = useState(false);

  const toggleLog = () => {
    setIsLogOpen(!isLogOpen);
  };

  return (
    <>
      <IconButton
        onClick={toggleLog}
        style={{ position: 'fixed', top: 20, right: 60 }}
        color="primary"
      >
        <MenuBookIcon />
      </IconButton>

      <Drawer anchor="right" open={isLogOpen} onClose={toggleLog}>
        <div style={{ width: '500px', padding: '20px' }}>
          <IconButton onClick={toggleLog} style={{ float: 'right' }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" gutterBottom>Last 10 Daily Cash Rewards</Typography>
          <List>
            {rounds.slice(0, 10).map(round => (
              <Card key={round.id} style={{ marginBottom: '10px' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    {moment(round.timestamp.toDate()).format('MMMM Do YYYY, h:mm:ss a')}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>{round.displayName}</strong> - Reward: <span style={{ color: 'green' }}>
                      ${round.rewardAmount}
                    </span>
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

export default DailyCashLog;
