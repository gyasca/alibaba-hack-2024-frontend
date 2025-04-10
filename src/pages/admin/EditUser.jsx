import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, TextField, Button, MenuItem, Snackbar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../../http';

function EditUser() {
  const [snackbar, setSnackbar] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await http.get(`/user/${userId}`);
        setInitialValues(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setSnackbar({ message: 'Error fetching user data', severity: 'error' });
      }
    };
    fetchUser();
  }, [userId]);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().required('Role is required'),
    staffId: Yup.string().when('role', {
      is: 'staff',
      then: Yup.string().required('Staff ID is required for staff'),
    }),
    department: Yup.string().when('role', {
      is: 'staff',
      then: Yup.string().required('Department is required for staff'),
    }),
    position: Yup.string().when('role', {
      is: 'staff',
      then: Yup.string().required('Position is required for staff'),
    }),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      name: '',
      email: '',
      role: '',
      staffId: '',
      department: '',
      position: '',
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await http.put(`/user/${userId}`, values);
        setSnackbar({ message: 'User updated successfully', severity: 'success' });
        navigate('/admin/users');
      } catch (error) {
        setSnackbar({ message: 'Error updating user', severity: 'error' });
      }
    },
  });

  if (!initialValues) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Edit User</Typography>
      <form onSubmit={formik.handleSubmit}>
        {/* Form fields similar to CreateUser, but without password field */}
        <Button color="primary" variant="contained" fullWidth type="submit">
          Update User
        </Button>
      </form>
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        message={snackbar?.message}
      />
    </Box>
  );
}

export default EditUser;