// src/components/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Container, TextField, Button, Typography } from '@mui/material';
import SnackbarMessage from './SnackbarMessage';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Maak een Firestore document voor de gebruiker
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        balance: 50 // of een andere startwaarde
      });
      navigate('/games');
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" gutterBottom>Register</Typography>
      <form onSubmit={handleRegister}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Register
        </Button>
      </form>
      <SnackbarMessage
        open={snackbar.open}
        onClose={() => setSnackbar({ open: false, message: '', severity: '' })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Container>
  );
}

export default Register;
