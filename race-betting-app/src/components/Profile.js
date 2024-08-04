// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button, Container, Typography, TextField } from '@mui/material';

function Profile() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
    } else {
      loadUserData();
    }
  }, [navigate]);

  const loadUserData = async () => {
    const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUser(userData);
      setEmail(userData.email);
      setDisplayName(userData.displayName);
    }
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom>Profile</Typography>
      {user && (
        <>
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
          <Button variant="contained" color="primary">Update Profile</Button>
        </>
      )}
    </Container>
  );
}

export default Profile;
