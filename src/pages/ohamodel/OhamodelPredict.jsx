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
    <Box
      sx={{
        mt: 2,
        mb: 4,
        px: 2, // Remove padding on the left and right to utilize full width
        mx: 0,
        maxWidth: "100%", // Ensure it takes the full available width
      }}
    >
      {/* Header Card - Full Width */}
      <Card
        className="shadow-sm hover:shadow-md transition-shadow"
        sx={{ mb: 2 }}
      >
        <CardContent className="p-6">
          <Box className="flex flex-col">
            <Typography variant="h3" className="font-semibold">
              Oral Analysis
            </Typography>
            <Typography variant="body1" color="textSecondary">
              AI-Powered Oral Condition Diagnosis
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <ImageUploadForPredictionGregory
        modelRoute={"/ohamodel/predict"}
        labelMapping={labelMapping}
        updateOralHistory={updateOralHistory}
      />
      <OralHistory
        refreshTrigger={oralHistory}
        labelMapping={labelMapping}
        jwtUserId={jwtUser()}
      />
      <Chatbot
        singleOralResult={oralHistory}
        labelMapping={labelMapping}
        jwtUserId={jwtUser()}
      />
    </Box>
  );
}

export default OhamodelPredict;
