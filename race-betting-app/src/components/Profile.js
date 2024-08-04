// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button, Container, TextField, Typography, Switch, FormControlLabel } from '@mui/material';

function Profile() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
    } else {
      loadUserData();
    }
  }, [navigate]);

  const loadUserData = async () => {
    const user = auth.currentUser;
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setEmail(userData.email);
      setDisplayName(userData.displayName);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const user = auth.currentUser;
      await updateDoc(doc(firestore, 'users', user.uid), {
        displayName: displayName
      });
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" gutterBottom>Profile</Typography>

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
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpdateProfile}
        fullWidth
      >
        Update Profile
      </Button>
    </Container>
  );
}

export default Profile;
