import React, { useState, useEffect, useContext } from "react";
import ImageUploadForPredictionGregory from "../../components/AI/OralHealthAnalysis/ImageUploadForPredictionGregory";
import OralHistory from "../../components/AI/OralHealthAnalysis/OralHistory";
import useUser from "../../context/useUser";
import Chatbot from "../../components/AI/OralHealthAnalysis/Chatbot";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";
import { UserContext } from "../../main";

function OhamodelPredict() {
  const [refreshHistory, setRefreshHistory] = useState(0);  // Use counter instead of array
  const { userId, userLoading } = useUser();  // Use stored userId directly
  const { conditionCountRefresh, setConditionCountRefresh } = useContext(UserContext);

  console.log("OhamodelPredict - userId:", userId, "userLoading:", userLoading);

  const labelMapping = {
    0: "Caries",
    1: "Gingivitis",
    2: "Tooth Discoloration",
    3: "Ulcer",
  };

  // Modified to directly accept the prediction results
  const updateOralHistory = (newPrediction) => {
    console.log("updateOralHistory called with prediction:", newPrediction);
    if (newPrediction && newPrediction.predictions) {
      setRefreshHistory(prev => prev + 1); // Increment refresh counter
    }
  };

  // Debug useEffect to monitor state changes
  useEffect(() => {
    setConditionCountRefresh(prev => prev + 1); // Just increment the refresh counter
    console.log("History refresh triggered:", refreshHistory);
  }, [refreshHistory, setConditionCountRefresh]);

  if (userLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!userId) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Alert severity="error">
          User not logged in. Please log in to access this feature.
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 2,
        mb: 4,
        px: 2,
        display: "flex",
        justifyContent: "center"
      }}
    >
      <Card
        className="shadow-sm hover:shadow-md transition-shadow"
        sx={{
          width: '100%',
          border: "1px solid #ccc",
          borderRadius: 2,
          transition: "box-shadow 0.3s ease-in-out",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <CardContent>
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 1 }}>
            Oral Analysis
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', mb: 4 }}>
            AI-Powered Oral Condition Diagnosis
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box id="analysis-section" sx={{ scrollMarginTop: '2rem' }}>
              <Card sx={{ p: 3, borderRadius: 2, border: "1px solid #eee" }}>
                <ImageUploadForPredictionGregory
                  modelRoute={"/ohamodel/predict"}
                  labelMapping={labelMapping}
                  updateOralHistory={updateOralHistory}
                  jwtUserId={userId}  // Pass stored userId directly
                />
              </Card>
            </Box>
            
            <Box id="oral-history" sx={{ scrollMarginTop: '2rem' }}>
              <Card sx={{ p: 3, borderRadius: 2, border: "1px solid #eee" }}>
                <OralHistory
                  refreshTrigger={refreshHistory}  // Use counter instead of array
                  labelMapping={labelMapping}
                  jwtUserId={userId}  // Pass stored userId directly
                />
              </Card>
            </Box>
            
            <Box id="chatbot" sx={{ scrollMarginTop: '2rem' }}>
              <Card sx={{ p: 3, borderRadius: 2, border: "1px solid #eee" }}>
                <Chatbot
                  singleOralResult={null}  // Don't pass history array here
                  labelMapping={labelMapping}
                  jwtUserId={userId}  // Pass stored userId directly
                />
              </Card>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default OhamodelPredict;