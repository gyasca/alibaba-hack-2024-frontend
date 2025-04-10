import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import { ArcherContainer, ArcherElement } from "react-archer";
import http from '../http'

const CurvyPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  padding: theme.spacing(2),
  backgroundColor: "#F0F4F8",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  marginBottom: theme.spacing(2),
  cursor: "pointer",
}));

const CareerMap = ({ courseCode }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCourseModules();
  }, [courseCode]);

  const fetchCourseModules = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/courseModule/course/${courseCode}/modules`);
      setModules(response.data);
    } catch (error) {
      console.error("Error fetching course modules:", error);
      setError("Failed to fetch course modules. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  const complexityLevels = [...new Set(modules.map(m => m.complexityLevel))].sort((a, b) => a - b);

  return (
    <Container maxWidth="xl" sx={{ marginTop: "2rem" }}>
      <Typography variant="h4" gutterBottom>Skill Map for Course: {courseCode}</Typography>
      <ArcherContainer strokeColor="blue">
        <Grid container spacing={4}>
          {complexityLevels.map((level) => (
            <Grid item xs={12 / complexityLevels.length} key={level}>
              <Typography variant="h6" textAlign="center">CL{level}</Typography>
              {modules
                .filter(module => module.complexityLevel === level)
                .sort((a, b) => a.order - b.order)
                .map((module) => (
                  <ArcherElement
                    key={module.id}
                    id={module.moduleCode}
                    relations={module.nextModuleCode ? [{
                      targetId: module.nextModuleCode,
                      targetAnchor: 'left',
                      sourceAnchor: 'right',
                      style: { strokeColor: 'purple', strokeWidth: 2, strokeDasharray: '5,5' },
                    }] : []}
                  >
                    <CurvyPaper onClick={() => handleModuleClick(module)}>
                      <Typography variant="body1">{module.Module.moduleCode}</Typography>
                      <Typography variant="body2">{module.Module.title}</Typography>
                    </CurvyPaper>
                  </ArcherElement>
                ))}
            </Grid>
          ))}
        </Grid>
      </ArcherContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{selectedModule?.Module.moduleCode}: {selectedModule?.Module.title}</DialogTitle>
        <DialogContent>
          <Typography><strong>Description:</strong> {selectedModule?.Module.description}</Typography>
          <Typography><strong>Credit:</strong> {selectedModule?.Module.credit}</Typography>
          <Typography><strong>Competency Level:</strong> {selectedModule?.complexityLevel}</Typography>
          <Typography><strong>Order:</strong> {selectedModule?.order}</Typography>
          {selectedModule?.prevModuleCode && (
            <Typography><strong>Previous Module:</strong> {selectedModule.prevModuleCode}</Typography>
          )}
          {selectedModule?.nextModuleCode && (
            <Typography><strong>Next Module:</strong> {selectedModule.nextModuleCode}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CareerMap;