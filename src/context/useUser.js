import { useContext, useEffect, useState } from "react";
import { UserContext } from "../main";
import http from "../http";
import { jwtDecode } from "jwt-decode";

function useUser() {
  const { setUser, user, userLoading } = useContext(UserContext);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !user) {
      refreshUser(); // Attempt to restore session if a token exists
    }
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
      } catch (error) {
        console.error("Error decoding token in useEffect:", error);
        setUserId(null);
      }
    }
  }, [user]);

  const refreshUser = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("No access token found");
      setUserId(null);
      return;
    }

    try {
      const res = await http.get("/auth/refresh", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setUser(res.data.user);
        localStorage.setItem("accessToken", res.data.token);
        
        // Update userId after successful refresh
        try {
          const decoded = jwtDecode(res.data.token);
          setUserId(decoded.userId);
        } catch (error) {
          console.error("Error decoding refreshed token:", error);
          setUserId(null);
        }
        
        console.log("Token refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing token:", error.response?.data || error);
      setUserId(null);
    }
  };

  const jwtUser = () => {
    // First check our stored userId
    if (userId) {
      return userId;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found");
      return null;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
      if (!decoded.userId) {
        console.error("No userId in token");
        return null;
      }
      // Update stored userId
      setUserId(decoded.userId);
      return decoded.userId;
    } catch (error) {
      console.error("Error decoding token in jwtUser:", error);
      setUserId(null);
      return null;
    }
  };

  const isAuthenticated = () => {
    return !!userId;
  };

  return { 
    user, 
    refreshUser, 
    userLoading, 
    jwtUser,
    isAuthenticated,
    userId: userId // Expose the stored userId directly
  };
}

export default useUser;
