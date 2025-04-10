import React, { useContext, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import { PhotoCamera, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../main";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";

function Register() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [previewImage, setPreviewImage] = useState(null);
  const [tempFilePath, setTempFilePath] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
      role: "user",
      profile_photo_file_path: "",
    },
    validationSchema: yup.object({
      username: yup
        .string()
        .trim()
        .min(1, "Username must be at least 1 character")
        .max(50, "Username must be at most 50 characters")
        .required("Username is required")
        .matches(
          /^[a-zA-Z0-9 '-,.]+$/,
          "Only allow letters, numbers, spaces, and characters: ' - , ."
        ),
      email: yup
        .string()
        .trim()
        .email("Enter a valid email")
        .max(50, "Email must be at most 50 characters")
        .required("Email is required"),
      password: yup
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required")
        .matches(
          /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/,
          "At least 1 letter and 1 number"
        ),
      confirmPassword: yup
        .string()
        .trim()
        .required("Confirm password is required")
        .oneOf([yup.ref("password")], "Passwords must match"),
      profile_photo_file_path: yup.mixed(),
    }),
    // onSubmit: async (data) => {
    //   try {
    //     let profilePhotoFilePath = null;

    //     if (data.profilePhoto) {
    //       const fileName = `${Date.now()}-${data.profilePhoto.name}`;
    //       const filePath = `/src/assets/${fileName}`;
    //       // In a real application, you would handle file upload to your server here
    //       profilePhotoFilePath = filePath;
    //     }

    //     const userData = {
    //       email: data.email.trim().toLowerCase(),
    //       password: data.password,
    //       username: data.username,
    //       role: data.role,
    //       profilePhotoFilePath
    //     };

    //     const res = await http.post("/user/register", userData);
    //     toast.success("Registration successful. Please log in.");
    //     navigate("/login");
    //   } catch (err) {
    //     toast.error(`Registration failed: ${err.response?.data?.message || "Unknown error"}`);
    //   }
    // }
    onSubmit: (data) => {
      // Prepare the registration data
      const userData = {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        username: data.username,
        role: "user",
        profile_photo_file_path: data.profile_photo_file_path || null,
      };

      console.log("User data to register: ", userData);

      // Register the user
      http
        .post("/user/register", userData)
        .then((registerRes) => {
          console.log(registerRes.data);
          toast.success("Registration successful. Logging you in...");

          // Log in the user after successful registration
          const loginData = {
            email: data.email.trim().toLowerCase(),
            password: data.password,
          };

          http
            .post("/user/login", loginData)
            .then((loginRes) => {
              console.log("Login response:", loginRes.data);

              // Store the access token in localStorage
              const accessToken = loginRes.data.accessToken;
              localStorage.setItem("accessToken", accessToken);

              // Decode the access token to get user details
              const decodedToken = jwtDecode(accessToken);
              const userId = decodedToken.userId;

              console.log(
                "Successfully authenticated, accessToken:",
                accessToken
              );
              console.log(
                "Successfully authenticated, decoded Token:",
                decodedToken
              );
              console.log("Successfully authenticated, user id:", userId);

              // Fetch user details using the user ID
              http
                .get(`/user/${userId}`)
                .then((userRes) => {
                  console.log("User details:", userRes.data);

                  // Set user data in your application state (if applicable)
                  setUser(userRes.data);

                  // Navigate based on user role
                  if (userRes.data.role === "admin") {
                    navigate("/admin/home");
                  } else {
                    navigate("/dashboard");
                  }
                })
                .catch((userErr) => {
                  console.error("Error fetching user details:", userErr);
                  toast.error("Error fetching user details");
                });
            })
            .catch((loginErr) => {
              console.error("Error logging in:", loginErr);
              toast.error("Email or password is incorrect");
            });
        })
        .catch((registerErr) => {
          console.error("Registration failed:", registerErr);
          toast.error(
            `Registration failed: ${
              registerErr.response?.data?.message || "Unknown error"
            }`
          );
        });
    },
  });

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload image
      const formData = new FormData();
      formData.append("profilePhoto", file);

      try {
        const res = await http.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        formik.setFieldValue("profile_photo_file_path", res.data.filePath);
        setTempFilePath(res.data.filePath);
        console.log(tempFilePath);
        console.log(res.data.filePath);
      } catch (err) {
        toast.error("Failed to upload image");
      }
    }
  };

  const removeImage = () => {
    formik.setFieldValue("profile_photo_file_path", null);
    setPreviewImage(null);

    // Extract only the filename from the full URL
    const fileNameToDelete = tempFilePath.split(import.meta.env.VITE_FILE_BASE_URL + "/uploads/")[1]; // Removes base URL

    http.delete("/delete/" + fileNameToDelete).then((deleteRes) => {
        console.log("Delete response:", deleteRes.data);
    }).catch((error) => {
        console.error("Error deleting file:", error);
    });
};


  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log(decoded);

    const userData = {
      email: decoded.email,
      password: "googlesecretpasswordxx94n2a",
      username: decoded.name,
      profile_photo_file_path: decoded.picture,
    };

    http
      .get(`/user/email/${decoded.email}`)
      .then((res) => {
        console.log("User already exists:", res.data);
        loginUser(decoded.email);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
        http
          .post("/user/register", userData)
          .then((res) => {
            console.log("New user registered:", res.data);
            loginUser(decoded.email);
          })
          .catch((err) => {
            toast.error(
              `Registration failed: ${
                err.response?.data?.message || "Unknown error"
              }`
            );
          });
      });
  };

  const loginUser = (email) => {
    const loginRequest = {
      email: email,
      password: "googlesecretpasswordxx94n2a",
    };
    http
      .post("/user/login", loginRequest)
      .then((res) => {
        localStorage.setItem("accessToken", res.data.accessToken);
        setUser(res.data);
        navigate("/");
      })
      .catch((err) => {
        toast.error(
          `Login failed: ${err.response?.data?.message || "Unknown error"}`
        );
      });
  };

  return (
    <Box
      sx={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h5" sx={{ my: 2 }}>
        Register
      </Typography>

      {/* Profile Photo Upload Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={previewImage || ""}
            sx={{ width: 100, height: 100, mb: 2 }}
          />

          {previewImage && (
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: -10,
                right: -10,
                bgcolor: "background.paper",
              }}
              onClick={removeImage}
            >
              <Delete />
            </IconButton>
          )}
        </Box>
        <Button
          component="label"
          variant="outlined"
          startIcon={<PhotoCamera />}
          sx={{ mt: 1 }}
        >
          Upload Photo
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={handleImageChange}
          />
        </Button>
      </Paper>

      <Box
        sx={{
          maxWidth: "500px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.log("Login Failed");
            toast.error("Google login failed");
          }}
        />
        <Typography variant="body2" sx={{ my: 2 }}>
          OR
        </Typography>
      </Box>

      <Box
        component="form"
        sx={{ maxWidth: "500px" }}
        onSubmit={formik.handleSubmit}
      >
        <TextField
          fullWidth
          margin="dense"
          autoComplete="off"
          label="Username"
          name="username"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />
        <TextField
          fullWidth
          margin="dense"
          autoComplete="off"
          label="Email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth
          margin="dense"
          autoComplete="off"
          label="Password"
          name="password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
        <TextField
          fullWidth
          margin="dense"
          autoComplete="off"
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.confirmPassword &&
            Boolean(formik.errors.confirmPassword)
          }
          helperText={
            formik.touched.confirmPassword && formik.errors.confirmPassword
          }
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          sx={{ my: 2 }}
        >
          Register
        </Button>
      </Box>
      <ToastContainer />
    </Box>
  );
}

export default Register;
