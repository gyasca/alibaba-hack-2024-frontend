import React from 'react';
import { Container, Box, Paper, Typography, Grid, Button } from '@mui/material';
import { styled } from '@mui/system';

// Define custom styled components for curvy aesthetics
const CurvyPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '20px',
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: '#F0F4F8',
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
}));

const CurvyButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: theme.spacing(1, 3),
  margin: theme.spacing(1),
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
}));

const Map = () => {
  return (
    <Container maxWidth="xl" sx={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        DAAA Curriculum Competence Map
      </Typography>
      
      <Grid container spacing={4} justifyContent="center">
        {/* Competence Levels */}
        {['CL1', 'CL2', 'CL3', 'CL4', 'CL5'].map((level) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={level}>
            <CurvyPaper elevation={3}>
              <Typography variant="h6">{level}</Typography>
            </CurvyPaper>
          </Grid>
        ))}
      </Grid>
      
      <Box display="flex" justifyContent="center" flexWrap="wrap" mt={4}>
        {/* Modules */}
        <CurvyPaper>
          <Typography variant="body1">AI & Data Analytics</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Applied Mathematics in Computing</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Business Innovation & Enterprise</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Cybersecurity Technologies & Ethics</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Database Design & Administration</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Network Technologies</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Programming</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Statistical Research Methods</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">UX Design in Web Development</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Web Development Project</Typography>
        </CurvyPaper>
      </Box>
      
      <Box display="flex" justifyContent="center" flexWrap="wrap" mt={4}>
        {/* Year 2 Modules */}
        <CurvyPaper>
          <Typography variant="body1">Agile Development Process with DevOps</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Cloud Computing</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Data Structures & Algorithms</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Digital User Experience Design</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Full Stack Application Development</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Responsible AI for Sustainability</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">IT Innovation Project</Typography>
        </CurvyPaper>
      </Box>

      <Box display="flex" justifyContent="center" flexWrap="wrap" mt={4}>
        {/* Year 2 Specialisation Modules */}
        <CurvyPaper>
          <Typography variant="body1">Machine Learning Operations</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Applied Deep Learning</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Applied Machine Learning</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Cloud Architecture</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Cloud Development</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Cloud Operations</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">AI-Enabled Mobile Application Development</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Blockchain Development</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Immersive Experience Development</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Applications Security</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Cybersecurity Attack & Defence</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Cyber Forensic Technologies & Process</Typography>
        </CurvyPaper>
      </Box>

      <Box display="flex" justifyContent="center" flexWrap="wrap" mt={4}>
        {/* Year 3 Modules */}
        <CurvyPaper>
          <Typography variant="body1">Final Year Project</Typography>
        </CurvyPaper>
        <CurvyPaper>
          <Typography variant="body1">Internship Programme</Typography>
        </CurvyPaper>
      </Box>
    </Container>
  );
};

export default Map;
