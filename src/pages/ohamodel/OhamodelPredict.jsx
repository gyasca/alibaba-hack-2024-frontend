import React, { useState, useEffect, useContext } from "react";
import ImageUploadForPredictionGregory from "../../components/AI/OralHealthAnalysis/ImageUploadForPredictionGregory";
import OralHistory from "../../components/AI/OralHealthAnalysis/OralHistory";
import useUser from "../../context/useUser";
import Chatbot from "../../components/AI/OralHealthAnalysis/Chatbot";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import { UserContext } from "../../main";

function OhamodelPredict() {
  const [oralHistory, setOralHistory] = useState([]);
  const { user, jwtUser } = useUser();
  const {conditionCountRefresh, setConditionCountRefresh} = useContext(UserContext);

  const labelMapping = {
    0: "Caries",
    1: "Gingivitis",
    2: "Tooth Discoloration",
    3: "Ulcer",
  };

  console.log("OhamodelPredict rendering with oralHistory:", oralHistory);

  // Modified to directly accept the prediction results
  const updateOralHistory = (newPrediction) => {
    console.log("updateOralHistory called with prediction:", newPrediction);

    if (newPrediction && newPrediction.predictions) {
      setOralHistory((prevHistory) => {
        const newHistory = [
          ...prevHistory,
          {
            timestamp: new Date().toISOString(),
            predictions: newPrediction.predictions,
          },
        ];
        console.log("Setting new oral history:", newHistory);
        return newHistory;
      });
    }
  };

  // Debug useEffect to monitor state changes
  useEffect(() => {
    setConditionCountRefresh(oralHistory);
    console.log("oralHistory state updated:", oralHistory);
  }, [oralHistory]);

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
                />
              </Card>
            </Box>
            
            <Box id="oral-history" sx={{ scrollMarginTop: '2rem' }}>
              <Card sx={{ p: 3, borderRadius: 2, border: "1px solid #eee" }}>
                <OralHistory
                  refreshTrigger={oralHistory}
                  labelMapping={labelMapping}
                  jwtUserId={jwtUser()}
                />
              </Card>
            </Box>
            
            <Box id="chatbot" sx={{ scrollMarginTop: '2rem' }}>
              <Card sx={{ p: 3, borderRadius: 2, border: "1px solid #eee" }}>
                <Chatbot
                  singleOralResult={oralHistory}
                  labelMapping={labelMapping}
                  jwtUserId={jwtUser()}
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