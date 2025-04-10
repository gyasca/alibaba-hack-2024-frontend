import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  CircularProgress,
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Alert,
  Stack,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  PhotoCamera as PhotoCameraIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Replay as ReplayIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import http from "../../../http";
import SaveResultsButton from "./SaveResultsButton";

const MAX_FILE_SIZE = 2048 * 2048; // 2MB
const IMAGE_PREVIEW_HEIGHT = 400; // Consistent height for previews

// Image preview component definition
const ImagePreviewBox = ({ image, title }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Paper
      elevation={2}
      sx={{
        p: 1,
        bgcolor: "grey.50",
        borderRadius: 2,
        overflow: "hidden",
        height: IMAGE_PREVIEW_HEIGHT,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src={image}
        alt={title}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          borderRadius: 8,
        }}
      />
    </Paper>
  </Box>
);

const ImageUploadForPrediction = ({
  modelRoute,
  labelMapping,
  onPredictionResults,
  predictionResults,
  updateOralHistory,
  jwtUserId  // Add user ID prop
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [uploading, setUploading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  const groupPredictions = (predictions) => {
    return predictions.reduce((acc, prediction) => {
      const className = labelMapping[prediction.pred_class] || "Unknown";
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(prediction);
      return acc;
    }, {});
  };

  const handleFile = async (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setError("Maximum file size is 2MB");
      return;
    }

    const validMIMETypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validMIMETypes.includes(file.type)) {
      setError("Invalid file type. Please upload an image (JPEG, PNG, GIF).");
      return;
    }

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await http.post(`${modelRoute}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Server response:", response.data);

      // Store prediction result with all data including OSS URL
      setPredictionResult(response.data);
      if (typeof updateOralHistory === 'function') {
        updateOralHistory(response.data);
      }
      
    } catch (err) {
      setError("Prediction failed. Please try again.");
      console.error("Prediction error:", err);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      await handleFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png, image/gif",
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      setCameraError(
        "Unable to access camera. Please make sure you've granted camera permissions."
      );
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const aspectRatio = video.videoWidth / video.videoHeight;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      canvas.getContext("2d").drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      setCapturedImage(imageDataUrl);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const acceptPhoto = async () => {
    if (capturedImage) {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });

      await handleFile(file);
      stopCamera();
    }
  };

  const drawBoundingBoxes = (imageSrc, predictions) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      predictions.forEach((prediction, index) => {
        const {
          x_center,
          y_center,
          width,
          height,
          pred_class: classIndex,
          confidence,
        } = prediction;
        const x = x_center - width / 2;
        const y = y_center - height / 2;

        // Draw bounding box
        ctx.strokeStyle = "#39FF14";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        const label = labelMapping[classIndex] || "Unknown";
        const confidenceText = (confidence * 100).toFixed(1);

        // Display label above or below the box
        const labelText = `Box ${index + 1} - ${confidenceText}% ${label}`;

        // Draw the label
        ctx.font = "bold 16px Poppins";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(labelText, x, y > 20 ? y - 10 : y + height + 20);
      });

      setFinalImage(canvas.toDataURL());
    };
  };

  React.useEffect(() => {
    if (predictionResult && imagePreview) {
      drawBoundingBoxes(imagePreview, predictionResult.predictions);
    }
  }, [predictionResult, imagePreview]);

  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <>
      <Stack spacing={4} sx={{ width: '100%' }}>
        {/* Title Section */}
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Oral Condition Detector
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload or capture an image of your teeth/gum/mouth for AI analysis
          </Typography>
        </Box>

        {/* Upload Section */}
        <Box>
          <Paper
            {...getRootProps()}
            elevation={0}
            sx={{
              border: "2px dashed",
              borderColor: isDragActive ? "primary.main" : "grey.300",
              borderRadius: 2,
              p: 3,
              bgcolor: isDragActive ? "primary.50" : "background.paper",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "primary.50",
              },
              mb: error ? 2 : 0,
            }}
          >
            <input {...getInputProps()} />
            <Box sx={{ textAlign: "center" }}>
              {uploading ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography>Analyzing your image...</Typography>
                  <LinearProgress sx={{ width: "100%", maxWidth: 300, mx: "auto" }} />
                </Box>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drag & drop your image here
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    or
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button variant="contained" startIcon={<CloudUploadIcon />} component="span">
                      Choose File
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCameraIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera();
                      }}
                    >
                      Take Photo
                    </Button>
                  </Stack>
                  <Typography variant="caption" sx={{ mt: 2, display: "block" }} color="text.secondary">
                    Accepts JPEG, PNG, GIF (max 2MB)
                  </Typography>
                </>
              )}
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" icon={<ErrorIcon />}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Results Section */}
        {(imagePreview || predictionResult) && (
          <Box sx={{
            bgcolor: "grey.50",
            borderRadius: 2,
            p: 3,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            {/* Image Previews */}
            {imagePreview && (
              <Grid container spacing={3} mb={predictionResult ? 4 : 0}>
                <Grid item xs={12} md={6}>
                  <ImagePreviewBox image={imagePreview} title="Original Image" />
                </Grid>
                {finalImage && (
                  <Grid item xs={12} md={6}>
                    <ImagePreviewBox image={finalImage} title="Analysis Results" />
                  </Grid>
                )}
              </Grid>
            )}

            {/* Analysis Results */}
            {predictionResult && predictionResult.predictions && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 3 }}>
                  Detected Conditions
                </Typography>
                <Stack spacing={2}>
                  {Object.entries(groupPredictions(predictionResult.predictions))
                    .map(([className, predictions]) => (
                      <Accordion
                        key={className}
                        expanded={expandedAccordion === className}
                        onChange={() => setExpandedAccordion(expandedAccordion === className ? false : className)}
                        sx={{
                          boxShadow: 'none',
                          '&.MuiAccordion-root': {
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            '&:before': { display: 'none' },
                          }
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            bgcolor: 'primary.50',
                            '&:hover': { bgcolor: 'primary.100' }
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center" width="100%">
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                              {className}
                            </Typography>
                            <Chip
                              size="small"
                              label={predictions.length}
                              color="primary"
                              sx={{ ml: 'auto', mr: 2 }}
                            />
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={1.5}>
                            {predictions.map((prediction, idx) => (
                              <Stack
                                key={idx}
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                sx={{
                                  p: 1,
                                  borderRadius: 1,
                                  '&:hover': { bgcolor: 'action.hover' },
                                }}
                              >
                                <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                                <Typography variant="body2">
                                  Box {idx + 1} - {(prediction.confidence * 100).toFixed(1)}% {className}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    ))}

                  {/* Save Results Section */}
                  {predictionResult && predictionResult.image_url && (
                    <Box
                      sx={{
                        mt: 4,
                        p: 3,
                        bgcolor: 'primary.50',
                        borderRadius: 2,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Save Analysis Results
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Save these results to your oral health history
                      </Typography>
                      <SaveResultsButton
                        imagePathWithHostURL={predictionResult.image_url}
                        drawBoundingBox={drawBoundingBoxes}
                        predictionResult={predictionResult}
                        onSave={updateOralHistory}
                        userId={jwtUserId}
                      />
                    </Box>
                  )}
                </Stack>
              </>
            )}
          </Box>
        )}
      </Stack>

      <Dialog
        open={isCameraOpen}
        onClose={stopCamera}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'grey.900',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: 'grey.800',
            color: 'common.white',
            p: 2,
            borderBottom: 1,
            borderColor: 'grey.700'
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {capturedImage ? "Preview Photo" : "Take Photo"}
            </Typography>
            <IconButton
              onClick={stopCamera}
              size="small"
              sx={{
                color: 'grey.400',
                '&:hover': {
                  color: 'error.light',
                  bgcolor: 'error.dark',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', bgcolor: 'grey.900' }}>
            {cameraError ? (
              <Box sx={{ p: 3 }}>
                <Alert
                  severity="error"
                  variant="filled"
                  sx={{ width: '100%' }}
                >
                  {cameraError}
                </Alert>
              </Box>
            ) : capturedImage ? (
              <Box sx={{ height: IMAGE_PREVIEW_HEIGHT, position: 'relative' }}>
                <img
                  src={capturedImage}
                  alt="Captured"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ height: IMAGE_PREVIEW_HEIGHT, position: 'relative' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            bgcolor: 'grey.800',
            borderTop: 1,
            borderColor: 'grey.700',
            justifyContent: 'center'
          }}
        >
          {capturedImage ? (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={retakePhoto}
                startIcon={<ReplayIcon />}
                color="error"
                sx={{ px: 3 }}
              >
                Retake
              </Button>
              <Button
                variant="contained"
                onClick={acceptPhoto}
                startIcon={<CheckIcon />}
                color="success"
                sx={{ px: 3 }}
              >
                Use Photo
              </Button>
            </Stack>
          ) : (
            <Button
              variant="contained"
              onClick={capturePhoto}
              startIcon={<PhotoCameraIcon />}
              sx={{ px: 4, py: 1.5 }}
              color="primary"
            >
              Take Photo
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageUploadForPrediction;
