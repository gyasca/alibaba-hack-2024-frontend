// 220147Q Chng Kai Jie Ryan
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CircularProgress, Typography } from "@mui/material";
import http from "../../http";

const MAX_FILE_SIZE = 2048 * 2048; // 2MB

const ImageUploadForPrediction = ({ modelRoute, labelMapping }) => {
  const [uploading, setUploading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [finalImage, setFinalImage] = useState(null); // To hold final image after drawing bounding boxes

  const savePredictionResult = async (imageData, predictions) => {
    try {
      if (!imageData) {
        console.error("No image data available");
        setError("Failed to save analysis: No image data");
        return;
      }

      // Get the annotated image URL from the canvas
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = imageData;

      await new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          // Draw the original image
          ctx.drawImage(img, 0, 0);

          // Draw bounding boxes
          ctx.strokeStyle = "yellow"; // Changed to yellow for better visibility
          ctx.lineWidth = 3; // Made lines thicker

          console.log("Drawing predictions:", predictions); // Debug log
          predictions.forEach((pred) => {
            const x = pred.x_center - pred.width / 2;
            const y = pred.y_center - pred.height / 2;
            console.log(
              `Drawing box at (${x}, ${y}) with width ${pred.width} and height ${pred.height}`
            ); // Debug log

            // Draw the bounding box
            ctx.strokeRect(x, y, pred.width, pred.height);

            // Add label with background for better visibility
            const label = getConditionName(pred.class);
            ctx.font = "16px Arial";
            const textWidth = ctx.measureText(label).width;

            // Draw label background
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(x, y - 20, textWidth + 4, 20);

            // Draw label text
            ctx.fillStyle = "red";
            ctx.fillText(label, x + 2, y - 5);
          });

          resolve();
        };
      });

      const annotatedImageUrl = canvas.toDataURL("image/jpeg");
      console.log(
        "Generated annotated image URL length:",
        annotatedImageUrl.length
      ); // Debug log

      const analysisData = {
        imageUrl: imageData,
        annotatedImageUrl: annotatedImageUrl,
        predictions: predictions,
        timestamp: new Date().toISOString(),
        notes: "",
      };

      console.log("Sending analysis data with annotated image"); // Debug log

      const response = await http.post("/skin-analysis/save", analysisData);

      if (response.data && response.data.id) {
        console.log("Analysis saved successfully with ID:", response.data.id);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error saving analysis:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError("Failed to save analysis results.");
    }
  };

  const getConditionName = (classId) => {
    const conditions = {
      1: "blackhead",
      2: "whitehead",
      3: "papule",
      4: "pustule",
      5: "nodule",
    };
    return conditions[classId] || "unknown";
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > MAX_FILE_SIZE) {
          setError("Maximum file size is 2MB");
          return;
        }

        setUploading(true);
        setError(null);

        // Read file as base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result;
          setImagePreview(base64Data);

          try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await http.post(`${modelRoute}`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            if (response.data && response.data.predictions) {
              setPredictionResult(response.data);
              await savePredictionResult(base64Data, response.data.predictions);
            }
          } catch (err) {
            console.error("Error processing image:", err);
            setError("Failed to process image.");
          } finally {
            setUploading(false);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [modelRoute]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png, image/gif",
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  const drawBoundingBoxes = (imageSrc, predictions) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      predictions.forEach((prediction) => {
        const {
          x_center,
          y_center,
          width,
          height,
          class: classIndex,
        } = prediction;

        // Calculate the top-left corner of the bounding box
        const x = x_center - width / 2;
        const y = y_center - height / 2;

        // Draw the bounding box
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Get the label for the class index (dynamic based on passed prop)
        const label = labelMapping[classIndex] || "Unknown"; // Default to 'Unknown' if no label exists for the class

        // Draw the label near the bounding box
        ctx.font = "16px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(label, x, y > 10 ? y - 10 : 10); // Draw above the bounding box, adjust if near the top
      });

      // Set the final image with bounding boxes and labels
      setFinalImage(canvas.toDataURL()); // Save the final image to state
    };
  };

  // If prediction result is available, draw the bounding boxes on the image
  if (predictionResult && imagePreview) {
    drawBoundingBoxes(imagePreview, predictionResult.predictions);
  }

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <CircularProgress />
        ) : (
          <Typography>
            Drag & drop an image, or click to select a file
          </Typography>
        )}
      </div>

      {error && <Typography color="error">{error}</Typography>}

      {imagePreview && (
        <div
          style={{
            marginTop: "20px",
            maxWidth: "300px",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <img
            src={imagePreview}
            alt="Uploaded preview"
            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
          />
        </div>
      )}

      {predictionResult && (
        <div>
          <Typography variant="h6">Prediction Result:</Typography>
          {predictionResult.predictions &&
            predictionResult.predictions.length > 0 && (
              <ul>
                {predictionResult.predictions.map((prediction, index) => (
                  <li key={index}>
                    {labelMapping[prediction.class] || "Unknown"}
                  </li>
                ))}
              </ul>
            )}

          {/* Display final image with bounding boxes and labels */}
          <div>
            <Typography variant="body1">
              Detected Image with Bounding Boxes:
            </Typography>
            {finalImage && (
              <div
                style={{
                  marginTop: "20px",
                  maxWidth: "300px",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={finalImage}
                  alt="Prediction result with bounding boxes and labels"
                  style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadForPrediction;
