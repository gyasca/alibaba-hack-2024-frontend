import { useContext, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import NotFound from "../errors/NotFound";
import AdminPanelLanding from "./AdminPanelLanding";
import AdminNavList from "../../components/AdminNavList";
import ViewEmployees from "./ViewEmployees";
import EditEmployee from "./EditEmployee";
import ViewLeave from "./ViewLeave";
import ViewUsers from "./ViewUsers";
import CreateUser from "./CreateUser";
import EditUser from "./EditUser";
import BulkCreateUser from "../../components/BulkCreateUser";
import { UserContext } from "../../main";
import { useSnackbar } from "notistack";
import { validateAdmin } from "../../functions/user";
import { Box, List, Divider } from "@mui/material";
import ViewSpecificUser from "./ViewSpecificUser";

function AdminRoutes() {
  // Routes for admin pages. To add authenication so that only admins can access these pages, add a check for the user's role in the UserContext
  const { setIsAdminPage } = useContext(UserContext);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAdminPage(true);
    validateAdmin()
      .then((isAdmin) => {
        console.log(isAdmin);
        if (!isAdmin) {
          enqueueSnackbar("You must be a Health Buddy staff to view this page", {
            variant: "error",
          });
          console.log("You must be an Health Buddy staff to view this page");
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Error validating admin:", error);
        enqueueSnackbar("Error validating admin", { variant: "error" });
        navigate("/");
      });
  }, []);

  return (
    <Box sx={{ display: "flex", flexGrow: 1, flexWrap: 1 }}>
      <Box sx={{ display: ["none", "none", "flex"] }}>
        <List
          sx={{
            width: "250px",
            height: "fit-content",
            position: "sticky",
            top: 64,
          }}
        >
          <AdminNavList />
        </List>
        <Divider orientation="vertical" flexItem />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          flexWrap: 1,
          overflow: "hidden",
          marginLeft: "20px",
          marginRight: "20px",
        }}
      >
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path={"/home"} element={<AdminPanelLanding />} />
          <Route path={"/employees"} element={<ViewEmployees />} />
          <Route path={"/employees/edit/:id"} element={<EditEmployee />} />
          {/* <Route path={"/register"} element={<Register />} /> */}
          <Route path={"/leaverequests"} element={<ViewLeave />} />
          <Route path="/users" element={<ViewUsers />} />
          <Route path="/users/create" element={<CreateUser />} />
          <Route path="/users/bulk-create" element={<BulkCreateUser />} />
          <Route path="/users/edit/:userId" element={<EditUser />} />
          <Route path="/users/:userId" element={<ViewSpecificUser />} />

        </Routes>
      </Box>
    </Box>
  );
}

export default AdminRoutes;
