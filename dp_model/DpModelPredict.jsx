import React, { useState, useEffect,useRef } from "react";
import {
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Divider,
  LinearProgress,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function FormComponent() {
  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    height: "",
    weight: "",
    sysBP: "",
    diaBP: "",
    BPMeds: "",
    diabetes: "",
    prevalentStroke: "",
    prevalentHyp: "",
    currentSmoker: "",
    cigsPerDay: "",
  });

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  // Modified drawPieChart function to only show risk percentage
const drawPieChart = (ctx, centerX, centerY, radius, data, colors) => {
  let startAngle = 0;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  data.forEach((slice, i) => {
    const sliceAngle = (2 * Math.PI * slice.value) / total;
    
    // Draw slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    
    // Only draw label for the risk portion (first slice)
    if (i === 0) {  // Risk is always the first slice in our data
      const labelAngle = startAngle + sliceAngle / 2;
      const labelX = centerX + (radius + 15) * Math.cos(labelAngle);
      const labelY = centerY + (radius + 15) * Math.sin(labelAngle);
      
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${slice.value.toFixed(1)}%`, labelX, labelY);
    }
    
    startAngle += sliceAngle;
  });
};

const generatePDFReport = async () => {
  if (!resultRef.current) return;

  // Create a new jsPDF instance
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Add title
  pdf.setFontSize(16);
  pdf.text('Health Risk Prediction Report', 10, 15);

  // Add current date
  const currentDate = new Date().toLocaleDateString();
  pdf.setFontSize(10);
  pdf.text(`Generated on: ${currentDate}`, 10, 22);

  // Personal Information Section
  pdf.setFontSize(12);
  pdf.text('Personal Information', 10, 32);
  pdf.setFontSize(10);
  pdf.text(`Gender: ${formData.gender === '0' ? 'Female' : 'Male'}`, 10, 39);
  pdf.text(`Age: ${formData.age} years`, 10, 45);

  // Physical Measurements Section
  pdf.setFontSize(12);
  pdf.text('Physical Measurements', 10, 55);
  pdf.setFontSize(10);
  pdf.text(`Height: ${formData.height} cm`, 10, 62);
  pdf.text(`Weight: ${formData.weight} kg`, 10, 68);

  // BMI Analysis
  const bmi = calculateBMI();
  const bmiCategory = getBMIDescription(bmi);
  pdf.text(`BMI: ${bmi}`, 10, 74);
  pdf.text(`BMI Category: ${bmiCategory}`, 10, 80);

  // Blood Pressure Section
  pdf.setFontSize(12);
  pdf.text('Blood Pressure Information', 10, 90);
  pdf.setFontSize(10);
  pdf.text(`Systolic BP: ${formData.sysBP} mmHg`, 10, 97);
  pdf.text(`Diastolic BP: ${formData.diaBP} mmHg`, 10, 103);
  pdf.text(`BP Category: ${getBPCategory(formData.sysBP, formData.diaBP)}`, 10, 109);
  pdf.text(`BP Medication: ${formData.BPMeds === '0' ? 'No' : 'Yes'}`, 10, 115);

  // Medical History Section
  pdf.setFontSize(12);
  pdf.text('Medical History', 10, 125);
  pdf.setFontSize(10);
  pdf.text(`Diabetes: ${formData.diabetes === '0' ? 'No' : 'Yes'}`, 10, 132);
  pdf.text(`Prevalent Stroke: ${formData.prevalentStroke === '0' ? 'No' : 'Yes'}`, 10, 138);
  pdf.text(`Prevalent Hypertension: ${formData.prevalentHyp === '0' ? 'No' : 'Yes'}`, 10, 144);

  // Lifestyle Section
  pdf.setFontSize(12);
  pdf.text('Lifestyle Information', 10, 154);
  pdf.setFontSize(10);
  pdf.text(`Current Smoker: ${formData.currentSmoker === '0' ? 'No' : 'Yes'}`, 10, 161);
  if (formData.currentSmoker === '1') {
    pdf.text(`Cigarettes per day: ${formData.cigsPerDay}`, 10, 167);
  }

  // Risk Assessment Results
  pdf.setFontSize(12);
  pdf.text('Risk Assessment Results', 10, 177);
  pdf.setFontSize(10);
  pdf.text(`Overall Risk Level: ${result.riskLevel}`, 10, 184);
  pdf.text(`Confidence Score: ${Math.round(result.confidence * 100)}%`, 10, 190);

  // Create a canvas for the charts
  const chartsCanvas = document.createElement('canvas');
  chartsCanvas.width = 800;
  chartsCanvas.height = 200;
  const ctx = chartsCanvas.getContext('2d');

  // Clear canvas with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, chartsCanvas.width, chartsCanvas.height);

  // Draw three pie charts
  const charts = [
    {
      title: 'Heart Disease Risk',
      data: [
        { name: 'Risk', value: result.heartDiseaseRisk },
        { name: 'No Risk', value: 100 - result.heartDiseaseRisk }
      ],
      colors: COLORS.heartDisease
    },
    {
      title: 'Stroke Risk',
      data: [
        { name: 'Risk', value: result.strokeRisk },
        { name: 'No Risk', value: 100 - result.strokeRisk }
      ],
      colors: COLORS.stroke
    },
    {
      title: 'Diabetes Risk',
      data: [
        { name: 'Risk', value: result.diabetesRisk },
        { name: 'No Risk', value: 100 - result.diabetesRisk }
      ],
      colors: COLORS.diabetes
    }
  ];

  // Draw each chart
  charts.forEach((chart, index) => {
    const centerX = 150 + (index * 250);
    const centerY = 100;
    
    // Draw title
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(chart.title, centerX, 30);
    
    // Draw pie chart
    drawPieChart(ctx, centerX, centerY, 50, chart.data, chart.colors);
  });

  // Add the charts image to PDF
  const chartImage = chartsCanvas.toDataURL('image/png');
  pdf.addImage(chartImage, 'PNG', 10, 215, 190, 50);

  // Save the PDF
  pdf.save('Health_Risk_Report.pdf');
};
  

  useEffect(() => {
    const filledFields = Object.values(formData).filter((value) => value !== "").length;
    const totalFields = Object.keys(formData).length;
    setProgress((filledFields / totalFields) * 100);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Color palette for pie charts
  const COLORS = {
    heartDisease: ['#FF6384', '#FF9999'],
    stroke: ['#36A2EB', '#4BC0C0'],
    diabetes: ['#FFCE56', '#FFD700']
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Form validation
    const requiredFields = [
      'gender', 'age', 'height', 'weight', 'sysBP', 'diaBP', 
      'BPMeds', 'diabetes', 'prevalentStroke', 'prevalentHyp', 
      'currentSmoker'
    ];

    // Add cigsPerDay only if currentSmoker is 'Yes'
    if (formData.currentSmoker === "1") {
      requiredFields.push('cigsPerDay');
    }

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields. Missing: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    setError(null);

    // More sophisticated risk assessment
    const calculateRiskLevel = () => {
      let riskScore = 0;

      // Age risk
      const age = parseInt(formData.age);
      if (age > 50) riskScore += 0.3;
      if (age > 60) riskScore += 0.2;

      // BMI risk
      const bmi = calculateBMI();
      if (bmi < 18.5 || bmi > 25) riskScore += 0.2;

      // Blood pressure risk
      const sysBP = parseInt(formData.sysBP);
      const diaBP = parseInt(formData.diaBP);
      if (sysBP > 140 || diaBP > 90) riskScore += 0.3;

      // Medical history risk
      if (formData.diabetes === "1") riskScore += 0.3;
      if (formData.prevalentStroke === "1") riskScore += 0.3;
      if (formData.prevalentHyp === "1") riskScore += 0.2;

      // Smoking risk
      if (formData.currentSmoker === "1") {
        const cigsPerDay = parseInt(formData.cigsPerDay);
        if (cigsPerDay > 10) riskScore += 0.3;
        if (cigsPerDay > 20) riskScore += 0.2;
      }

      // Determine individual disease risks
      const heartDiseaseRisk = Math.min(100, riskScore * 70);
      const strokeRisk = Math.min(100, riskScore * 50);
      const diabetesRisk = Math.min(100, riskScore * 60);

      // Determine risk level
      let riskLevel = "Low";
      if (riskScore > 0.5 && riskScore <= 0.7) riskLevel = "Moderate";
      if (riskScore > 0.7) riskLevel = "High";

      return { 
        riskScore, 
        riskLevel, 
        heartDiseaseRisk, 
        strokeRisk, 
        diabetesRisk,
        confidence: Math.min(1, riskScore + Math.random() * 0.3)
      };
    };

    // Simulate prediction result after form submission
    setTimeout(() => {
      const riskResult = calculateRiskLevel();
      
      setResult({
        riskLevel: riskResult.riskLevel,
        riskScore: riskResult.riskScore,
        confidence: riskResult.confidence,
        heartDiseaseRisk: riskResult.heartDiseaseRisk,
        strokeRisk: riskResult.strokeRisk,
        diabetesRisk: riskResult.diabetesRisk
      });
      setLoading(false);
    }, 2000);
  };

  // Helper functions for BMI and BP calculations
  const calculateBMI = () => {
    const heightInMeters = formData.height / 100; // Convert height to meters
    return (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  const getBMIColor = (BMI) => {
    if (BMI < 18.5) return "#ffebee";
    if (BMI < 25) return "#c8e6c9";
    return "#ffcc80";
  };

  const getBMITextColor = (BMI) => (BMI < 18.5 || BMI >= 25 ? "black" : "white");

  const getBMIDescription = (BMI) => {
    if (BMI < 18.5) return "Underweight";
    if (BMI < 25) return "Normal weight";
    return "Overweight";
  };

  const getBPColor = (sysBP, diaBP) => {
    if (sysBP < 120 && diaBP < 80) return "#c8e6c9";
    if (sysBP < 140 && diaBP < 90) return "#ffebee";
    return "#ffcc80";
  };

  const getBPCategory = (sysBP, diaBP) => {
    if (sysBP < 120 && diaBP < 80) return "Normal";
    if (sysBP < 140 && diaBP < 90) return "Elevated";
    return "High";
  };

  // Custom Pie Chart Component
  const DiseaseRiskPieChart = ({ disease, value, colors }) => {
    const data = [
      { name: 'Risk', value: value },
      { name: 'No Risk', value: 100 - value }
    ];

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {disease} Risk
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)}%`, 'Risk']}
            />
          </PieChart>
        </ResponsiveContainer>
        <Typography variant="body1">
          {value.toFixed(2)}% Risk
        </Typography>
      </Box>
    );
  };

  return (
    <Card sx={{ maxWidth: 900, margin: "20px auto", p: 2 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom align="center">
          Health Risk Prediction
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom align="center">
          Enter your health information to get a risk assessment
        </Typography>

        <Box sx={{ width: "100%", mb: 4 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Form Completion Progress
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" align="right">
            {Math.round(progress)}%
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          {/* Personal Information Section */}
          <Box sx={{ border: "1px solid #ccc", p: 2, mb: 4, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    label="Gender"
                  >
                    <MenuItem value="0">Female</MenuItem>
                    <MenuItem value="1">Male</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Physical Measurements Section */}
          <Box sx={{ border: "1px solid #ccc", p: 2, mb: 4, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Physical Measurements
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange}
                  helperText="Enter height in centimeters"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  helperText="Enter weight in kilograms"
                />
              </Grid>
            </Grid>
          </Box>

          {formData.height && formData.weight && (
            <Paper
              sx={{
                p: 2,
                mb: 4,
                backgroundColor: getBMIColor(calculateBMI()),
                color: getBMITextColor(calculateBMI()),
              }}
            >
              <Grid container spacing={2} textAlign="center">
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Your BMI
                  </Typography>
                  <Typography variant="h4">{calculateBMI()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="h5">
                    {getBMIDescription(calculateBMI())}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Blood Pressure Section */}
          <Box sx={{ border: "1px solid #ccc", p: 2, mb: 4, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Blood Pressure Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Systolic BP"
                  name="sysBP"
                  type="number"
                  value={formData.sysBP}
                  onChange={handleInputChange}
                  helperText="mmHg"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Diastolic BP"
                  name="diaBP"
                  type="number"
                  value={formData.diaBP}
                  onChange={handleInputChange}
                  helperText="mmHg"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Blood Pressure Medication</InputLabel>
                  <Select
                    name="BPMeds"
                    value={formData.BPMeds}
                    onChange={handleInputChange}
                    label="Blood Pressure Medication"
                  >
                    <MenuItem value="0">No</MenuItem>
                    <MenuItem value="1">Yes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {formData.sysBP && formData.diaBP && (
            <Paper
              sx={{
                p: 2,
                mb: 4,
                backgroundColor: getBPColor(formData.sysBP, formData.diaBP),
              }}
            >
              <Grid container spacing={2} textAlign="center">
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Blood Pressure
                  </Typography>
                  <Typography variant="h4">
                    {formData.sysBP}/{formData.diaBP}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="h5">
                    {getBPCategory(formData.sysBP, formData.diaBP)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Medical History Section */}
          <Box sx={{ border: "1px solid #ccc", p: 2, mb: 4, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Medical History
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Diabetes</InputLabel>
                  <Select
                    name="diabetes"
                    value={formData.diabetes}
                    onChange={handleInputChange}
                    label="Diabetes"
                  >
                    <MenuItem value="0">No</MenuItem>
                    <MenuItem value="1">Yes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Prevalent Stroke</InputLabel>
                  <Select
                    name="prevalentStroke"
                    value={formData.prevalentStroke}
                    onChange={handleInputChange}
                    label="Prevalent Stroke"
                  >
                    <MenuItem value="0">No</MenuItem>
                    <MenuItem value="1">Yes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Prevalent Hypertension</InputLabel>
                  <Select
                    name="prevalentHyp"
                    value={formData.prevalentHyp}
                    onChange={handleInputChange}
                    label="Prevalent Hypertension"
                  >
                    <MenuItem value="0">No</MenuItem>
                    <MenuItem value="1">Yes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Lifestyle Section */}
          <Box sx={{ border: "1px solid #ccc", p: 2, mb: 4, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Lifestyle Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Current Smoker</InputLabel>
                  <Select
                    name="currentSmoker"
                    value={formData.currentSmoker}
                    onChange={handleInputChange}
                    label="Current Smoker"
                  >
                    <MenuItem value="0">No</MenuItem>
                    <MenuItem value="1">Yes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.currentSmoker === "1" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cigarettes per day"
                    name="cigsPerDay"
                    type="number"
                    value={formData.cigsPerDay}
                    onChange={handleInputChange}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

{result && (
          <Box 
            ref={resultRef} 
            sx={{ mt: 4 }}
          >
            <Typography variant="h6" gutterBottom>
              Risk Assessment Results
            </Typography>
            <Typography variant="body1">
              Overall Risk Level: {result.riskLevel}
            </Typography>
            <Typography variant="body1">
              Confidence Score: {Math.round(result.confidence * 100)}%
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <DiseaseRiskPieChart 
                  disease="Heart Disease" 
                  value={result.heartDiseaseRisk} 
                  colors={COLORS.heartDisease}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DiseaseRiskPieChart 
                  disease="Stroke" 
                  value={result.strokeRisk} 
                  colors={COLORS.stroke}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DiseaseRiskPieChart 
                  disease="Diabetes" 
                  value={result.diabetesRisk} 
                  colors={COLORS.diabetes}
                />
              </Grid>
            </Grid>

            {/* PDF Download Button */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={generatePDFReport}
              >
                Download Report as PDF
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}


export default FormComponent;


          

