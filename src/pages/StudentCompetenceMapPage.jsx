// StudentCompetenceMapPage.js
import React, { useState, useEffect, useContext } from "react";
import StudentReactFlowCareerMap from "../components/CompetencyMap/StudentReactFlowCareerMap";
import { Container, CircularProgress, Box } from "@mui/material";
import { UserContext } from '../main'; // Adjust the import path as needed

function StudentCompetenceMapPage() {
    const { user } = useContext(UserContext);
    const [courseCode, setCourseCode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect to ensure user is loaded before assigning user.course to courseCode variable
    useEffect(() => {
        const fetchCourseCode = async () => {
            // await new Promise(resolve => setTimeout(resolve, 100));
            
            if (user && user.course) {
                setCourseCode(user.course);
            } else {
                console.error("Course code not found in user context");
            }
            setIsLoading(false);
        };

        fetchCourseCode();
    }, [user]);

    if (isLoading) {
        return (
            <Container maxWidth="xl" sx={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!courseCode) {
        return (
            <Container maxWidth="xl" sx={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Box>Course code not found. Please check your profile or contact support.</Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ height: "80vh" }}>
            <StudentReactFlowCareerMap courseCode={courseCode} />
        </Container>
    );
}

export default StudentCompetenceMapPage;