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
import useUser from "../../../context/useUser";

const SaveResultsButton = ({
  imagePathWithHostURL,
  drawBoundingBoxes,
  predictionResult,
  onSave,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useUser();

  const handleSaveClick = async () => {
    setIsDialogOpen(true);
    setIsProcessing(true);
    setError(null);

    if (imagePathWithHostURL && predictionResult) {
      try {
        // Create a new image element
        const img = new Image();
        img.crossOrigin = "anonymous"; // Enable CORS

        // Create a promise to handle image loading
        const imageLoadPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Failed to load image"));
        });

        // Load the image
        img.src = imagePathWithHostURL;

        // Wait for image to load
        const loadedImg = await imageLoadPromise;

        // Create canvas and draw image
        const canvas = document.createElement("canvas");
        canvas.width = loadedImg.width;
        canvas.height = loadedImg.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(loadedImg, 0, 0);

        // Draw bounding boxes
        predictionResult.predictions.forEach((prediction, index) => {
          const {
            x_center,
            y_center,
            width,
            height,
            class: classIndex,
            confidence,
          } = prediction;
          const x = x_center - width / 2;
          const y = y_center - height / 2;

          // Draw box
          ctx.strokeStyle = "#39FF14";
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);

          // Draw label
          const confidenceText = (confidence * 100).toFixed(1);
          const labelText = `Box ${index + 1} - ${confidenceText}%`;

          ctx.font = "bold 16px Roboto";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(labelText, x, y > 20 ? y - 10 : y + height + 20);
        });

        // Convert to data URL
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setProcessedImage(dataUrl);

        // Convert to blob for upload
        canvas.toBlob(
          async (blob) => {
            const formData = new FormData();
            formData.append("oralPhoto", blob, "processed_image.jpg");

            try {
              const response = await http.post("/upload/oral", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
              setProcessedImage(response.data.filePathWithHostURL);
            } catch (err) {
              throw new Error("Failed to upload processed image");
            }
          },
          "image/jpeg",
          0.95
        );
      } catch (err) {
        setError(err.message || "Failed to process image");
        console.error("Processing error:", err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveHistory = async () => {
    if (!predictionResult || !processedImage || !user?.userId) {
      setError("Missing required data for saving history");
      return;
    }

    try {
      setIsProcessing(true);

      // Structure the data to match the backend's expectations
      const historyData = {
        user_id: user.userId,
        original_image_path: imagePathWithHostURL,
        condition_count: predictionResult.predictions.length,
        predictions: predictionResult.predictions.map((pred) => ({
          pred_class: pred.pred_class,
          confidence: pred.confidence,
          x_center: pred.x_center,
          y_center: pred.y_center,
          width: pred.width,
          height: pred.height,
        })),
      };

      console.log("History data to send:", historyData);
      const response = await http.post(
        "/history/oha/save-results",
        historyData
      );

      if (response.data.message === "Results saved successfully") {
        setIsDialogOpen(false);
        setError(null);
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
        disabled={isProcessing}
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
        <DialogTitle>Preview & Save Results</DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {processedImage && (
            <Box
              sx={{
                mt: 2,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <img
                src={processedImage}
                alt="Processed Result"
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
            onClick={async () => {
              await handleSaveHistory();
              onSave(predictionResult); // Pass the actual prediction result
            }}
            disabled={!processedImage || isProcessing}
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
