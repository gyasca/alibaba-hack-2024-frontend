import { useContext, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import NotFound from "./errors/NotFound";
import Home from "./Home";
import Login from "./Login";
import Map from "./Map";
import StudentPortal from "./StudentPortal";
import Dashboard from "./Dashboard";
import Test1 from "./Test1";
import Register from "./Register";
import HealthDashboard from "./HealthDashboard";
import OhamodelPredict from "./ohamodel/OhamodelPredict";
import DpModelPredict from "./dp_model/DpModelPredict";
import PredictionHistory from "./dp_model/PredictionHistory";
import AcnemodelPredict from "./acnemodel/AcnemodelPredict";
import AnalysisHistory from "./acnemodel/AnalysisHistory";
import ChatBot from "./acnemodel/ChatBot";
import EditProfile from "./EditProfile";
import { UserContext } from "../main";
import useUser from "../context/useUser";

function UserRoutes() {
  const { setIsAdminPage } = useContext(UserContext);
  const {jwtUser} = useUser();

  const jwtId = jwtUser();

  useEffect(() => {
    setIsAdminPage(false);
  }, []);

  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={!jwtId ? <Register /> : <Navigate to="/" />} />
      <Route path="/login" element={!jwtId ? <Login /> : <Navigate to="/" />} />
      
      {/* Protected routes (requires login) */}
      <Route path="/profile/edit" element={jwtId ? <EditProfile /> : <Navigate to="/login" />} />
      <Route path="/map" element={jwtId ? <Map /> : <Navigate to="/login" />} />
      <Route path="/studentportal" element={jwtId ? <StudentPortal /> : <Navigate to="/login" />} />
      <Route path="/test1" element={jwtId ? <Test1 /> : <Navigate to="/login" />} />
      <Route path="/dashboard" element={jwtId ? <HealthDashboard /> : <Navigate to="/login" />} />
      <Route path="/oral-health/analyse" element={jwtId ? <OhamodelPredict /> : <Navigate to="/login" />} />
      <Route path="/disease-prediction/analyse" element={jwtId ? <DpModelPredict /> : <Navigate to="/login" />} />
      <Route path="/prediction-history" element={jwtId ? <PredictionHistory /> : <Navigate to="/login" />} />
      <Route path="/acne-health/analyse" element={jwtId ? <AcnemodelPredict /> : <Navigate to="/login" />} />
      <Route path="/acne-health/chatbot" element={jwtId ? <ChatBot /> : <Navigate to="/login" />} />
      <Route path="/acne-health/analysis-history" element={jwtId ? <AnalysisHistory /> : <Navigate to="/login" />} />

      {/* <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/map" element={<Map />} />
      <Route path="/studentportal" element={<StudentPortal />} />
      <Route path="/test1" element={<Test1 />} />
      <Route path="/dashboard" element={<HealthDashboard />} />
      <Route path="/oral-health/analyse" element={<OhamodelPredict />} />
      <Route path="/disease-prediction/analyse" element={<DpModelPredict />} />
      <Route path="/prediction-history" element={<PredictionHistory />} />

      {/* if want to use this route must make sure to update the rest of the buttons that
      lead here. (unupdated as of 12 jan 2025) */}
      {/* <Route path="/dashboard-old" element={<Dashboard />} />

      <Route path="/acne-health/analyse" element={<AcnemodelPredict />} />
      <Route path="/acne-health/chatbot" element={<ChatBot />} />
      <Route path="/acne-health/analysis-history" element={<AnalysisHistory />}/>  */}
      
      {/* Default route for when the user isn't logged in and tries to access protected pages */}
      <Route path="/dashboard-old" element={jwtId ? <Dashboard /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default UserRoutes;
