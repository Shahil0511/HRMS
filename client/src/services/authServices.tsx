
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/auth";

export const loginUser = (data: { email: string; password: string }) =>
    axios.post(`${API_BASE_URL}/login`, data);

export const signupUser = (data: { name: string; email: string; password: string }) =>
    axios.post(`${API_BASE_URL}/signup`, data);
