import axios from "axios";

// const API_URL = "https://hrms-backend-7176.onrender.com/api/employees/user";
const API_URL = "http://localhost:8000/api/employees/user";

// Utility function to get the auth token from localStorage
const getAuthToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error(
      "No token found in localStorage. User might not be logged in."
    );
  }
  return token;
};

// Centralized API request function
const apiRequest = async <T>(
  url: string,
  method: "GET" | "POST",
  data?: object
): Promise<T> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authorization token not found.");
    }

    const response = await axios({
      method,
      url,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      if (error.response) {
        console.error("Response error:", error.response.data);
      }
    } else {
      console.error("Unexpected error:", error.message);
    }

    throw new Error("Failed to fetch data from the API.");
  }
};

// Function to fetch user data (username)
export const fetchUserName = async () => {
  try {
    const response = await apiRequest<{
      user: {
        role: string;
        name: string;
      };
    }>(API_URL, "GET");

    if (response?.user) {
      return response.user;
    }

    const errorMessage = "User data not found in response.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  } catch (error: any) {
    console.error("Failed to fetch user data:", error.message);
    throw new Error("Failed to fetch user info due to an error.");
  }
};
