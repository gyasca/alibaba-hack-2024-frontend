import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import http from '../../http'

const StudentEnrollment = ({ userId }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      const response = await http.get(`/students/${userId}/enrollments`);
      setEnrollments(response.data);
    };
    const fetchCourses = async () => {
      const response = await http.get('/courses/all');
      setCourses(response.data);
    };
    fetchEnrollments();
    fetchCourses();
  }, [userId]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEnroll = async () => {
    await http.post(`/students/${userId}/enroll`, { courseCode: selectedCourse });
    handleClose();
    // Refresh enrollments
    const response = await http.get(`/students/${userId}/enrollments`);
    setEnrollments(response.data);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Course Enrollments</Typography>
      <Button onClick={handleOpen}>Enroll in New Course</Button>
      <List>
        {enrollments.map(enrollment => (
          <ListItem key={enrollment.id}>
            <ListItemText 
              primary={enrollment.course.name} 
              secondary={`Year of Study: ${enrollment.yearOfStudy}`}
            />
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enroll in Course</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Course</InputLabel>
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map(course => (
                <MenuItem key={course.courseCode} value={course.courseCode}>{course.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleEnroll}>Enroll</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentEnrollment;