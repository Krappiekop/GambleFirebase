// src/components/PasswordReset.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Container, TextField, Button, Typography } from '@mui/material';
import SnackbarMessage from './SnackbarMessage';

function PasswordReset() {
  const [email, setEmail] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setSnackbar({ open: true, message: 'Password reset email sent!', severity: 'success' });
      navigate('/login');
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" gutterBottom>Reset Password</Typography>
      <form onSubmit={handlePasswordReset}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Send Reset Email
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

export default PasswordReset;
