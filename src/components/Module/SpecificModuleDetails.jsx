import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";
import http from "../../http";

function InfoBox({ title, value }) {
  return (
    <Box>
      <Typography variant="subtitle2">{title}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

function SpecificModuleDetails() {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const { moduleCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Module code:", moduleCode)
    fetchModule();
  }, [moduleCode]);

  const fetchModule = async () => {
    try {
      const response = await http.get(`/module/${moduleCode}`);
      setModule(response.data);
    } catch (error) {
      console.error("Error fetching module:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!module) {
    return <Typography>Module not found</Typography>;
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="module details tabs"
              variant="fullWidth"
            >
              <Tab label="General Info" value="1" />
              <Tab label="Additional Info" value="2" />
            </Tabs>
          </Paper>
          {activeTab === "1" && (
            <Paper elevation={3} sx={{ padding: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Module Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <InfoBox title="Module Code" value={module.moduleCode} />
                </Grid>
                <Grid item xs={6}>
                  <InfoBox title="Title" value={module.title} />
                </Grid>
                <Grid item xs={12}>
                  <InfoBox title="Description" value={module.description} />
                </Grid>
                <Grid item xs={6}>
                  <InfoBox title="Credit" value={module.credit} />
                </Grid>
                <Grid item xs={6}>
                  <InfoBox title="School" value={module.school} />
                </Grid>
              </Grid>
            </Paper>
          )}
          {activeTab === "2" && (
            <Paper elevation={3} sx={{ padding: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <InfoBox title="Domain" value={module.domain} />
                </Grid>
                <Grid item xs={6}>
                  <InfoBox title="Level of Study" value={module.levelOfStudy} />
                </Grid>
                <Grid item xs={6}>
                  <InfoBox title="Prerequisite" value={module.prerequisite || "None"} />
                </Grid>
                <Grid item xs={6}>
                  <InfoBox title="Competency Level" value={module.complexityLevel} />
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>
              {module.title}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              {module.moduleCode}
            </Typography>
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate(`/admin/modules/edit/${moduleCode}`)}
                sx={{ width: "100%", mb: 1 }}
              >
                Edit Module
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/admin/modules")}
                sx={{ width: "100%" }}
              >
                Back to Module List
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SpecificModuleDetails;