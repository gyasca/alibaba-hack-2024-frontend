import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid
} from '@mui/material';
import jsPDF from 'jspdf';
import useUser from '../../context/useUser';

function PredictionHistory() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const {user,jwtUser}=useUser();

  // Hardcoded user ID - replace with actual authentication
  const userId = jwtUser();

  useEffect(() => {
    const fetchPredictionHistory = async () => {
      try {
        const response = await fetch(`http://localhost:3001/dpmodel/history/${userId}`);
        console.log(response);
        if (!response.ok) {
          throw new Error('Failed to fetch prediction history');
        }

        const data = await response.json();

        if (data.success) {
          setPredictions(data.predictions);
        } else {
          throw new Error(data.error || 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Error fetching prediction history:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictionHistory();
  }, [userId]);

  const generatePDFReport = (prediction) => {
    // Create a new jsPDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add title
    pdf.setFontSize(16);
    pdf.text('Health Risk Prediction Report', 10, 15);

    // Add current date
    const currentDate = new Date(prediction.created_at).toLocaleDateString();
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${currentDate}`, 10, 22);

    // Personal Information Section
    pdf.setFontSize(12);
    pdf.text('Personal Information', 10, 32);
    pdf.setFontSize(10);
    pdf.text(`Gender: ${prediction.gender === 0 ? 'Female' : 'Male'}`, 10, 39);
    pdf.text(`Age: ${prediction.age} years`, 10, 45);

    // Blood Pressure Section
    pdf.setFontSize(12);
    pdf.text('Blood Pressure Information', 10, 55);
    pdf.setFontSize(10);
    pdf.text(`Systolic BP: ${prediction.sys_bp} mmHg`, 10, 62);
    pdf.text(`Diastolic BP: ${prediction.dia_bp} mmHg`, 10, 68);
    pdf.text(`BP Medication: ${prediction.bp_meds === 0 ? 'No' : 'Yes'}`, 10, 74);

    // Medical History Section
    pdf.setFontSize(12);
    pdf.text('Medical History', 10, 84);
    pdf.setFontSize(10);
    pdf.text(`Diabetes: ${prediction.diabetes === 0 ? 'No' : 'Yes'}`, 10, 91);
    pdf.text(`Prevalent Stroke: ${prediction.prevalent_stroke === 0 ? 'No' : 'Yes'}`, 10, 97);
    pdf.text(`Prevalent Hypertension: ${prediction.prevalent_hyp === 0 ? 'No' : 'Yes'}`, 10, 103);

    // Lifestyle Section
    pdf.setFontSize(12);
    pdf.text('Lifestyle Information', 10, 113);
    pdf.setFontSize(10);
    pdf.text(`Current Smoker: ${prediction.current_smoker === 0 ? 'No' : 'Yes'}`, 10, 120);
    if (prediction.current_smoker === 1) {
      pdf.text(`Cigarettes per day: ${prediction.cigs_per_day}`, 10, 126);
    }

    // BMI Information
    pdf.setFontSize(12);
    pdf.text('Physical Measurements', 10, 136);
    pdf.setFontSize(10);
    pdf.text(`BMI: ${prediction.bmi.toFixed(2)}`, 10, 143);

    // Risk Assessment Results
    pdf.setFontSize(12);
    pdf.text('Risk Assessment Results', 10, 153);
    pdf.setFontSize(10);
    pdf.text(`Risk Score: ${prediction.risk_score.toFixed(2)}%`, 10, 160);
    pdf.text(`Risk Level: ${prediction.risk_level}`, 10, 166);

    // Save the PDF
    pdf.save(`Health_Risk_Report_${currentDate}.pdf`);
  };

  const getRiskLevelColor = (riskLevel) => {
    switch(riskLevel) {
      case 'Low': return 'green';
      case 'Moderate': return 'orange';
      case 'High': return 'red';
      default: return 'black';
    }
  };

  const handlePredictionSelect = (prediction) => {
    setSelectedPrediction(prediction);
  };

  const handleCloseDialog = () => {
    setSelectedPrediction(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Prediction History
      </Typography>
      
      {predictions.length === 0 ? (
        <Typography variant="body1">
          No prediction history found.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {predictions.map((prediction) => (
                <TableRow 
                  key={prediction.id} 
                  hover 
                  onClick={() => handlePredictionSelect(prediction)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    {new Date(prediction.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{prediction.age}</TableCell>
                  <TableCell>{prediction.gender === 0 ? 'Female' : 'Male'}</TableCell>
                  <TableCell>
                    {prediction.risk_score.toFixed(2)}%
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      color: getRiskLevelColor(prediction.risk_level),
                      fontWeight: 'bold'
                    }}
                  >
                    {prediction.risk_level}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        generatePDFReport(prediction);
                      }}
                    >
                      Download PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detailed View Dialog */}
      {selectedPrediction && (
        <Dialog 
          open={!!selectedPrediction} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Prediction Details</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Personal Information</Typography>
                <Typography>Age: {selectedPrediction.age}</Typography>
                <Typography>Gender: {selectedPrediction.gender === 0 ? 'Female' : 'Male'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Risk Assessment</Typography>
                <Typography>Risk Score: {selectedPrediction.risk_score.toFixed(2)}%</Typography>
                <Typography 
                  sx={{ 
                    color: getRiskLevelColor(selectedPrediction.risk_level),
                    fontWeight: 'bold'
                  }}
                >
                  Risk Level: {selectedPrediction.risk_level}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Blood Pressure</Typography>
                <Typography>Systolic BP: {selectedPrediction.sys_bp} mmHg</Typography>
                <Typography>Diastolic BP: {selectedPrediction.dia_bp} mmHg</Typography>
                <Typography>BP Medication: {selectedPrediction.bp_meds === 0 ? 'No' : 'Yes'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Medical History</Typography>
                <Typography>Diabetes: {selectedPrediction.diabetes === 0 ? 'No' : 'Yes'}</Typography>
                <Typography>Prevalent Stroke: {selectedPrediction.prevalent_stroke === 0 ? 'No' : 'Yes'}</Typography>
                <Typography>Prevalent Hypertension: {selectedPrediction.prevalent_hyp === 0 ? 'No' : 'Yes'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Lifestyle</Typography>
                <Typography>Current Smoker: {selectedPrediction.current_smoker === 0 ? 'No' : 'Yes'}</Typography>
                {selectedPrediction.current_smoker === 1 && (
                  <Typography>Cigarettes per Day: {selectedPrediction.cigs_per_day}</Typography>
                )}
              </Grid>
              <Grid item xs={12} container justifyContent="center">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => generatePDFReport(selectedPrediction)}
                >
                  Download Full PDF Report
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}

export default PredictionHistory;