// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button } from '@mui/material';

function Home() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h3" gutterBottom>Welcome to Race Betting App</Typography>
      <Button
        component={Link}
        to="/register"
        variant="contained"
        color="primary"
        fullWidth
        style={{ marginBottom: '10px' }}
      >
        Register
      </Button>
      <Button
        component={Link}
        to="/login"
        variant="contained"
        color="secondary"
        fullWidth
      >
        Login
      </Button>
    </Container>
  );
}

export default Home;
