import React from 'react';
import { Switch } from '@mui/material';

function DarkModeSwitch({ isDarkMode, handleToggle }) {
  return (
    <Switch
      checked={isDarkMode}
      onChange={handleToggle}
      inputProps={{ 'aria-label': 'dark mode toggle' }}
    />
  );
}

export default DarkModeSwitch;
