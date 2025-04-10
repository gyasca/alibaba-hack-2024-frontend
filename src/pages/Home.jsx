// src/App.jsx
import React from 'react';
import LandingPage from '../components/LandingPage';
import { Container } from '@mui/material';

const App = () => {
  return (
    <Container sx={{marginBottom: '10vh'}}>
      <LandingPage />
    </Container>
  );
}

export default App;