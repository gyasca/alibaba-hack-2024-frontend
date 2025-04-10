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

const ImageUploadForPrediction = ({
  modelRoute,
  labelMapping,
  onPredictionResults,
  predictionResults,
  updateOralHistory,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [uploading, setUploading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [originalImagePathWithHostURL, setOriginalImagePathWithHostURL] =
    useState(null);
  const [newHistory, setNewHistory] = useState([]);

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

      setPredictionResult(response.data);
      setNewHistory(response.data);
      console.log("Prediction results:", response.data);
    } catch (err) {
      setError("Prediction failed. Please try again.");
      console.error("Prediction error:", err);
    } finally {
      setUploading(false);
    }

    const formDataForUpload = new FormData();
    formDataForUpload.append("oralPhoto", file);

    try {
      const img_upload_response = await http.post(
        "/upload/oral",
        formDataForUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Store the file URL returned from the backend
      setOriginalImagePathWithHostURL(
        img_upload_response.data.filePathWithHostURL
      );
      console.log(img_upload_response.data.filePathWithHostURL);
    } catch (err) {
      setError("Upload failed.");
      console.error("Upload error:", err);
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

  // Camera functions remain the same...
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

  // const drawBoundingBoxes = (imageSrc, predictions) => {
  //   const img = new Image();
  //   img.src = imageSrc;
  //   img.onload = () => {
  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d");
  //     canvas.width = img.width;
  //     canvas.height = img.height;
  //     ctx.drawImage(img, 0, 0);

  //     predictions.forEach((prediction) => {
  //       const { x_center, y_center, width, height, class: classIndex } = prediction;
  //       const x = x_center - width / 2;
  //       const y = y_center - height / 2;

  //       ctx.strokeStyle = "#2196f3";
  //       ctx.lineWidth = 3;
  //       ctx.strokeRect(x, y, width, height);

  //       const label = labelMapping[classIndex] || "Unknown";

  //       ctx.font = "bold 16px Roboto";
  //       ctx.fillStyle = "#2196f3";
  //       ctx.fillText(label, x, y > 20 ? y - 10 : y + height + 20);
  //     });

  //     setFinalImage(canvas.toDataURL());
  //   };
  // };

  const parentFile = true;

  // new draw bounding boxes that adds labelling of boxes
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

        // Draw the bounding box
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

      if (parentFile) {
        setFinalImage(canvas.toDataURL());
      } else {
        resolve(canvas.toDataURL());
      }
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

  return (
    <>
      <Card elevation={3} sx={{ width: "100%" }}>
        <CardHeader
          title="Oral Condition Detector"
          subheader="Upload or capture an image of your teeth/gum/mouth for AI analysis"
          sx={{ textAlign: "center" }}
        />
        <CardContent>
          <Stack spacing={3}>
            {/* Upload Area */}
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
              }}
            >
              <input {...getInputProps()} />
              <Box sx={{ textAlign: "center" }}>
                <CloudUploadIcon
                  sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                />
                {uploading ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <CircularProgress size={24} />
                    <Typography>Analyzing your image...</Typography>
                    <LinearProgress
                      sx={{ width: "100%", maxWidth: 300, mx: "auto" }}
                    />
                  </Box>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Drag & drop your image here
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      or
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        component="span"
                      >
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
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ mt: 2, display: "block" }}
                    >
                      Accepts JPEG, PNG, GIF (max 2MB)
                    </Typography>
                  </>
                )}
              </Box>
            </Paper>

            {/* Error Message */}
            {error && (
              <Alert
                severity="error"
                icon={<ErrorIcon />}
                sx={{ width: "100%" }}
              >
                {error}
              </Alert>
            )}

            {predictionResult && originalImagePathWithHostURL && (
              <SaveResultsButton
                imagePathWithHostURL={originalImagePathWithHostURL}
                drawBoundingBox={drawBoundingBoxes}
                predictionResult={predictionResult}
                onSave={updateOralHistory}
              />
            )}

            {/* Image Previews */}
            {imagePreview && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <ImagePreviewBox
                    image={imagePreview}
                    title="Original Image"
                  />
                </Grid>
                {finalImage && (
                  <Grid item xs={12} md={6}>
                    <ImagePreviewBox
                      image={finalImage}
                      title="Analysis Results"
                    />
                  </Grid>
                )}
              </Grid>
            )}

            {/* Analysis Results */}
            {predictionResult && (
              <Box sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  {Object.entries(
                    groupPredictions(predictionResult.predictions)
                  ).map(([className, predictions]) => (
                    <Accordion
                      key={className}
                      defaultExpanded
                      sx={{
                        "&.MuiAccordion-root": {
                          borderRadius: 1,
                          "&:before": {
                            display: "none",
                          },
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          bgcolor: "primary.50",
                          "&:hover": { bgcolor: "primary.100" },
                          borderRadius: "4px 4px 0 0",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          width="100%"
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "medium" }}
                          >
                            {className}
                          </Typography>
                          <Chip
                            size="small"
                            label={predictions.length}
                            color="primary"
                            sx={{ ml: "auto", mr: 2 }}
                          />
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ bgcolor: "background.paper" }}>
                        <Stack spacing={1.5}>
                          {predictions.map((prediction, idx) => (
                            <Stack
                              key={idx}
                              direction="row"
                              spacing={2}
                              alignItems="center"
                              sx={{
                                pl: 1,
                                py: 0.5,
                                "&:hover": { bgcolor: "action.hover" },
                                borderRadius: 1,
                              }}
                            >
                              <CircleIcon
                                sx={{ fontSize: 8, color: "primary.main" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "medium" }}
                              >
                                Box {idx + 1} -{" "}
                                {(prediction.confidence * 100).toFixed(1)}%{" "}
                                {className}
                              </Typography>
                              {prediction.location && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Location: {prediction.location}
                                </Typography>
                              )}
                            </Stack>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Camera Dialog */}
      <Dialog
        open={isCameraOpen}
        onClose={stopCamera}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {capturedImage ? "Preview Photo" : "Take Photo"}
            </Typography>
            <IconButton
              onClick={stopCamera}
              size="small"
              sx={{
                "&:hover": {
                  bgcolor: "error.light",
                  color: "error.contrastText",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            minHeight: IMAGE_PREVIEW_HEIGHT,
            bgcolor: "grey.50",
          }}
        >
          {cameraError ? (
            <Alert
              severity="error"
              sx={{
                m: 2,
                width: "100%",
                maxWidth: 500,
              }}
            >
              {cameraError}
            </Alert>
          ) : capturedImage ? (
            // Show captured image preview
            <Box
              sx={{
                width: "100%",
                height: IMAGE_PREVIEW_HEIGHT,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
              }}
            >
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            </Box>
          ) : (
            // Show live camera feed
            <Box
              sx={{
                width: "100%",
                height: IMAGE_PREVIEW_HEIGHT,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            p: 2,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          {capturedImage ? (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={retakePhoto}
                startIcon={<ReplayIcon />}
                sx={{
                  "&:hover": {
                    bgcolor: "error.lighter",
                  },
                }}
              >
                Retake
              </Button>
              <Button
                variant="contained"
                onClick={acceptPhoto}
                startIcon={<CheckIcon />}
                color="success"
              >
                Use Photo
              </Button>
            </Stack>
          ) : (
            <Button
              variant="contained"
              onClick={capturePhoto}
              startIcon={<PhotoCameraIcon />}
              sx={{
                px: 4,
                py: 1,
                borderRadius: 2,
              }}
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
