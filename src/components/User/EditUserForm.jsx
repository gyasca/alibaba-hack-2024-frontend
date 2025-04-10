import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Grid,
  MenuItem,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
} from "@mui/material";
import http from "../../http";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  role: Yup.string().required("Role is required"),
  username: Yup.string().when("role", {
    is: "user",
    then: () => Yup.string().required("Username is required for users"),
    otherwise: () => Yup.string().notRequired(),
  }),
  profile_photo_file_path: Yup.string().when("role", {
    is: "user",
    then: () => Yup.string().required("Profile photo path is required for users"),
    otherwise: () => Yup.string().notRequired(),
  }),
});


function EditUserForm({ user, onSave, onCancel }) {
  const [snackbar, setSnackbar] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: user.email || "",
      role: user.role || "",
      username: user.username || "",
      profile_photo_file_path: user.profile_photo_file_path || "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const dataToSend = { ...values };

        // Only include username and profile_photo_file_path for 'user' role
        if (values.role !== "user") {
          delete dataToSend.username;
          delete dataToSend.profile_photo_file_path;
        }

        await http.put(`/user/${user.userId}`, dataToSend);
        setSnackbar({
          message: "User updated successfully",
          severity: "success",
        });
        onSave(dataToSend);
      } catch (error) {
        setSnackbar({
          message:
            "Error updating user: " +
            (error.response?.data?.message || error.message),
          severity: "error",
        });
      }
    },
  });

  useEffect(() => {
    formik.setValues({
      email: user.email || "",
      role: user.role || "",
      username: user.username || "",
      profile_photo_file_path: user.profile_photo_file_path || "",
    });
  }, [user]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="role"
              name="role"
              select
              label="Role"
              value={formik.values.role}
              onChange={formik.handleChange}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="specialist">Specialist</MenuItem>
            </TextField>
          </Grid>
          {formik.values.role === "user" && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.username && Boolean(formik.errors.username)
                  }
                  helperText={formik.touched.username && formik.errors.username}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="profile_photo_file_path"
                  name="profile_photo_file_path"
                  label="Profile Photo File Path"
                  value={formik.values.profile_photo_file_path}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.profile_photo_file_path &&
                    Boolean(formik.errors.profile_photo_file_path)
                  }
                  helperText={
                    formik.touched.profile_photo_file_path &&
                    formik.errors.profile_photo_file_path
                  }
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        message={snackbar?.message}
      />
    </form>
  );
}

export default EditUserForm;
