import { useContext, useEffect } from "react";
import { UserContext } from "../main";
import http from "../http";
import { jwtDecode } from "jwt-decode";

function useUser() {
  const { setUser, user, userLoading } = useContext(UserContext);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !user) {
      refreshUser(); // Attempt to restore session if a token exists
    }
  }, []);

  const refreshUser = async () => {
    const token = localStorage.getItem("accessToken"); // Retrieve token from localStorage

    if (!token) {
      console.error("No access token found");
      return;
    }

    try {
      const res = await http.get("/auth/refresh", {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token properly
        },
      });

      if (res.status === 200) {
        setUser(res.data.user);
        localStorage.setItem("accessToken", res.data.token);
        console.log("Token refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing token:", error.response?.data || error);
    }
  };

  const jwtUser = () => {
    const token = localStorage.getItem("accessToken"); // Retrieve token from localStorage

    if (!token) {
      console.error("No access token found");
      return null;
    }

    try {
      const decoded = jwtDecode(token); // Decode the JWT token
      console.log("decoded user at useUser.js", decoded);
      return decoded.userId; // Assuming the token contains a 'user' field
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  return { user, refreshUser, userLoading, jwtUser };
}

export default useUser;
