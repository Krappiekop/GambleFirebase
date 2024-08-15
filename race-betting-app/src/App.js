// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile'; // Importeer de Profile component
import PasswordReset from './components/PasswordReset'; // Importeer de PasswordReset component
import GameSelect from './components/GameSelect'; // Importeer de GameSelection component
import GuessTheNumber from './components/GuessTheNumber'; // Importeer de GuessTheNumber component
import DailyCash from './components/DailyCash'; // Importeer de GuessTheNumber component
import FreeSpin from './components/FreeSpin'; // Importeer de GuessTheNumber component
import Mine from './components/Mines';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Darkmode
import { CssBaseline, Container, Switch, FormControlLabel } from '@mui/material'; // Darkmode
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Container>
          <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} /> {/* Voeg de Profile route toe */}
          <Route path="/reset-password" element={<PasswordReset />} /> {/* Voeg de PasswordReset route toe */}
          <Route path="/games" element={<GameSelect />} /> {/* Voeg de GameSelection route toe */}
          <Route path="/guess-the-number" element={<GuessTheNumber />} /> {/* Voeg de GuessTheNumber route toe */}
          <Route path="/daily-cash" element={<DailyCash />} />
          <Route path="/free-spin" element={<FreeSpin />} />
          <Route path="/mine" element={<Mine />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
