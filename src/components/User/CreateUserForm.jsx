import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
  MenuItem,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import http from "../../http";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  role: Yup.string().required("Role is required"),
  staffId: Yup.string().when("role", {
    is: "staff",
    then: () => Yup.string().required("Staff ID is required for staff"),
    otherwise: () => Yup.string().notRequired(),
  }),
  department: Yup.string().when("role", {
    is: "staff",
    then: () => Yup.string().required("Department is required for staff"),
    otherwise: () => Yup.string().notRequired(),
  }),
  position: Yup.string().when("role", {
    is: "staff",
    then: () => Yup.string().required("Position is required for staff"),
    otherwise: () => Yup.string().notRequired(),
  }),
  adminNumber: Yup.string().when("role", {
    is: "student",
    then: () => Yup.string().required("Admin Number is required for students"),
    otherwise: () => Yup.string().notRequired(),
  }),
  course: Yup.string().when("role", {
    is: "student",
    then: () => Yup.string().required("Course is required for students"),
    otherwise: () => Yup.string().notRequired(),
  }),
  yearJoined: Yup.mixed().when("role", {
    is: "student",
    then: () => Yup.date().required("Year Joined is required for students"),
    otherwise: () => Yup.mixed().notRequired(),
  }),
});

function CreateUser() {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState(null);
  const [courses, setCourses] = useState([]);

  // useEffect(() => {
  //   const fetchCourses = async () => {
  //     try {
  //       const response = await http.get("/course/all");
  //       setCourses(response.data);
  //     } catch (error) {
  //       console.error("Failed to fetch courses:", error);
  //       setSnackbar({ message: "Failed to fetch courses", severity: "error" });
  //     }
  //   };
  //   fetchCourses();
  // }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      staffId: "",
      department: "",
      position: "",
      adminNumber: "",
      course: "",
      yearJoined: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const endpoint =
          values.role === "staff"
            ? "/user/staffregister"
            : "/user/studentregister";
        const dataToSend = { ...values };
        if (values.role === "student") {
          dataToSend.yearJoined = values.yearJoined
            ? values.yearJoined.year()
            : null;
        }
        await http.post(endpoint, dataToSend);
        setSnackbar({
          message: "User created successfully",
          severity: "success",
        });
        formik.resetForm();
      } catch (error) {
        setSnackbar({
          message:
            "Error creating user: " +
            (error.response?.data?.message || error.message),
          severity: "error",
        });
      }
    },
  });

  return (
    <Box sx={{ mx: "auto", mt: 8, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create Individual User
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            {/* ... (rest of the form fields remain the same) ... */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="student">Student</MenuItem>
              </TextField>
            </Grid>
            {formik.values.role === "staff" && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="staffId"
                    name="staffId"
                    label="Staff ID"
                    value={formik.values.staffId}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.staffId && Boolean(formik.errors.staffId)
                    }
                    helperText={formik.touched.staffId && formik.errors.staffId}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="department"
                    name="department"
                    label="Department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.department &&
                      Boolean(formik.errors.department)
                    }
                    helperText={
                      formik.touched.department && formik.errors.department
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="position"
                    name="position"
                    label="Position"
                    value={formik.values.position}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.position && Boolean(formik.errors.position)
                    }
                    helperText={
                      formik.touched.position && formik.errors.position
                    }
                  />
                </Grid>
              </>
            )}
            {formik.values.role === "student" && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="adminNumber"
                    name="adminNumber"
                    label="Admin Number"
                    value={formik.values.adminNumber}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.adminNumber &&
                      Boolean(formik.errors.adminNumber)
                    }
                    helperText={
                      formik.touched.adminNumber && formik.errors.adminNumber
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="course"
                    name="course"
                    select
                    label="Course"
                    value={formik.values.course}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.course && Boolean(formik.errors.course)
                    }
                    helperText={formik.touched.course && formik.errors.course}
                  >
                    {courses.map((course) => (
                      <MenuItem
                        key={course.courseCode}
                        value={course.courseCode}
                      >
                        {course.courseCode} - {course.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Year Joined"
                      views={["year"]}
                      value={formik.values.yearJoined}
                      onChange={(newValue) => {
                        formik.setFieldValue("yearJoined", newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={
                            formik.touched.yearJoined &&
                            Boolean(formik.errors.yearJoined)
                          }
                          helperText={
                            formik.touched.yearJoined &&
                            formik.errors.yearJoined
                          }
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
          </Grid>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="button"
              onClick={() => navigate("/admin/users")}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Create User
            </Button>
          </Box>
        </form>
      </Paper>
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        message={snackbar?.message}
      />
    </Box>
  );
}

export default CreateUser;
