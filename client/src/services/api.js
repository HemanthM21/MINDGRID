import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://mindgrid-2.onrender.com",
    headers: {
        "Content-Type": "application/json",
    },
});

api.setToken = (token) => {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};

// Check for existing token
const token = localStorage.getItem("token");
if (token) {
    api.setToken(token);
}

export default api;
