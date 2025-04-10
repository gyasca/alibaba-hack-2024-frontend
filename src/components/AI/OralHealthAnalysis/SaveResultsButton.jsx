import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import http from "../../../http";

const SaveResultsButton = ({
  imagePathWithHostURL,
  drawBoundingBoxes,
  predictionResult,
  onSave,
  userId,  // Use userId prop instead of useUser hook
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSaveClick = async () => {
    if (!imagePathWithHostURL || !predictionResult || !userId) {
      setError("Missing required data for saving results");
      return;
    }

    setIsDialogOpen(true);
    setError(null);
  };

  const handleSaveHistory = async () => {
    if (!predictionResult || !userId || !imagePathWithHostURL) {
      setError("Missing required data for saving history");
      console.error("Missing data:", { 
        hasPredictionResult: !!predictionResult, 
        hasUserId: !!userId,
        hasImageUrl: !!imagePathWithHostURL 
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Structure the data to match the backend's expectations
      const historyData = {
        user_id: userId,
        image_url: imagePathWithHostURL,  // Use the OSS URL directly
        predictions: predictionResult.predictions,
        condition_count: predictionResult.condition_count || predictionResult.predictions.length
      };

      console.log("History data to send:", historyData);
      const response = await http.post("/history/oha/save-results", historyData);

      if (response.data.message === "Results saved successfully") {
        setIsDialogOpen(false);
        setError(null);
        if (typeof onSave === 'function') {
          onSave(predictionResult);
        }
      } else {
        throw new Error("Failed to save results");
      }
    } catch (err) {
      setError(err.message || "Failed to save history");
      console.error("Save history error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setError(null);
  };

  return (
    <Box textAlign="center" mt={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveClick}
        disabled={isProcessing || !imagePathWithHostURL || !predictionResult || !userId}
        sx={{ borderRadius: 2, padding: "10px 20px" }}
      >
        {isProcessing ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            <Typography>Processing...</Typography>
          </Box>
        ) : (
          "Save Results"
        )}
      </Button>

      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Save Analysis Results</DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Save this analysis to your history?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This will save:
            </Typography>
            <ul>
              <li>The original image</li>
              <li>All detected conditions ({predictionResult?.predictions?.length || 0} items)</li>
              <li>Analysis details and measurements</li>
            </ul>
          </Box>

          {imagePathWithHostURL && (
            <Box
              sx={{
                mt: 2,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <img
                src={imagePathWithHostURL}
                alt="Analysis Result"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "8px",
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={handleDialogClose}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveHistory}
            disabled={isProcessing || !userId}
            color="success"
            sx={{ borderRadius: 2 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SaveResultsButton;
