import React from 'react';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';

const HeroText = () => {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        textAlign: 'center',
        color: '#fff',
        background: 'rgba(0, 0, 0, 0.8)', // Background color with opacity
        width: '50%', // Set a fixed width (adjust as needed)
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
      }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to NYP CM App
      </Typography>
      <Typography variant="h5" component="p" gutterBottom>
        Your ultimate competence mapping solution
      </Typography>
      <Button variant="contained" color="white" sx={{ color: 'primary.main' }} size="large">
        Get Started
      </Button>
    </div>
  );
};

export default HeroText;
