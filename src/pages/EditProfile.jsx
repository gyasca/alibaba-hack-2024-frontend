import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Stack,
  Grid,
  CardActions,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import EditIcon from "@mui/icons-material/Edit";
import BackIcon from "@mui/icons-material/ArrowBack";
import PasswordIcon from "@mui/icons-material/Password";
import PersonIcon from "@mui/icons-material/Person";
import useUser from "../context/useUser";
import http from "../http";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

function EditProfile() {
  const [user, setUser] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useUser();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Fetch user details on load
  useEffect(() => {
    document.title = "Edit Profile";
    http.get("/user")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  const editForm = useFormik({
    initialValues: {
      name: user.name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      delivery_address: user.delivery_address || "",
    },
    validationSchema: yup.object({
      name: yup.string().required("Required"),
      email: yup.string().email("Invalid email").required("Required"),
      phone_number: yup
        .string()
        .matches(/^\d{8}$/, "Phone number must be 8 digits")
        .required("Required"),
      delivery_address: yup.string().optional(),
    }),
    enableReinitialize: true, // Ensures form updates when user data loads
    onSubmit: (values) => {
      setLoading(true);
      http.put("/user", values)
        .then(() => {
          refreshUser();
          enqueueSnackbar("Profile updated successfully", { variant: "success" });
          setLoading(false);
        })
        .catch((err) => {
          enqueueSnackbar("Error updating profile: " + err.response.data.message, { variant: "error" });
          setLoading(false);
        });
    },
  });

  const passwordForm = useFormik({
    initialValues: {
      password: "",
      confirm_password: "",
    },
    validationSchema: yup.object({
      password: yup.string().required("Required"),
      confirm_password: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: (values) => {
      setLoading(true);
      http.put("/user", values)
        .then(() => {
          enqueueSnackbar("Password changed successfully", { variant: "success" });
          setLoading(false);
        })
        .catch((err) => {
          enqueueSnackbar("Error changing password: " + err.response.data.message, { variant: "error" });
          setLoading(false);
        });
    },
  });

  return (
    <>
      <Button variant="outlined" color="primary" onClick={() => navigate(-1)} startIcon={<BackIcon />}>
        Back
      </Button>

      <Stack direction="column" spacing={2} mt={2}>
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Edit Profile" icon={<PersonIcon />} iconPosition="start" />
              <Tab label="Change Password" icon={<PasswordIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Edit Profile Form */}
          <Box component="form" onSubmit={editForm.handleSubmit} display={tabValue === 0 ? "block" : "none"}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="email"
                    label="E-mail Address"
                    variant="outlined"
                    value={editForm.values.email}
                    onChange={editForm.handleChange}
                    error={editForm.touched.email && Boolean(editForm.errors.email)}
                    helperText={editForm.touched.email && editForm.errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Name"
                    variant="outlined"
                    value={editForm.values.name}
                    onChange={editForm.handleChange}
                    error={editForm.touched.name && Boolean(editForm.errors.name)}
                    helperText={editForm.touched.name && editForm.errors.name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="phone_number"
                    label="Phone Number"
                    variant="outlined"
                    value={editForm.values.phone_number}
                    onChange={editForm.handleChange}
                    error={editForm.touched.phone_number && Boolean(editForm.errors.phone_number)}
                    helperText={editForm.touched.phone_number && editForm.errors.phone_number}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="delivery_address"
                    label="Delivery Address"
                    variant="outlined"
                    value={editForm.values.delivery_address}
                    onChange={editForm.handleChange}
                    error={editForm.touched.delivery_address && Boolean(editForm.errors.delivery_address)}
                    helperText={editForm.touched.delivery_address && editForm.errors.delivery_address}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <LoadingButton loading={loading} type="submit" variant="text" color="primary" startIcon={<EditIcon />}>
                Edit Profile
              </LoadingButton>
            </CardActions>
          </Box>

          {/* Change Password Form */}
          <Box component="form" onSubmit={passwordForm.handleSubmit} display={tabValue === 1 ? "block" : "none"}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="password"
                    label="New Password"
                    variant="outlined"
                    type="password"
                    value={passwordForm.values.password}
                    onChange={passwordForm.handleChange}
                    error={passwordForm.touched.password && Boolean(passwordForm.errors.password)}
                    helperText={passwordForm.touched.password && passwordForm.errors.password}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="confirm_password"
                    label="Confirm Password"
                    variant="outlined"
                    type="password"
                    value={passwordForm.values.confirm_password}
                    onChange={passwordForm.handleChange}
                    error={passwordForm.touched.confirm_password && Boolean(passwordForm.errors.confirm_password)}
                    helperText={passwordForm.touched.confirm_password && passwordForm.errors.confirm_password}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <LoadingButton loading={loading} type="submit" variant="text" color="primary" startIcon={<EditIcon />}>
                Change Password
              </LoadingButton>
            </CardActions>
          </Box>
        </Card>
      </Stack>
    </>
  );
}

export default EditProfile;
