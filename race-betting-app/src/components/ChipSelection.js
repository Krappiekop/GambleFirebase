// src/components/ChipSelection.js
import React from 'react';
import { Button, Box } from '@mui/material';

const chipValues = [1, 5, 10, 20, 50];

function ChipSelection({ selectedChip, onSelectChip }) {
  return (
    <Box display="flex" justifyContent="center" mb={2}>
      {chipValues.map((value) => (
        <Button
          key={value}
          variant={selectedChip === value ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => onSelectChip(value)}
          style={{ margin: '0 5px' }}
        >
          ${value}
        </Button>
      ))}
    </Box>
  );
}

export default ChipSelection;
