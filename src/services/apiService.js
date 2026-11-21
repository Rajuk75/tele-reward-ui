import axios from "axios";
import { showNotification } from "../components/Toastify/Toast";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = BASE_URL.endsWith('/v1') ? BASE_URL : `${BASE_URL}/v1`;


export default async function callApi({
    endpoint,
    method,
    body,
    token,
    responseType = "json",
}) {
    try {
        let authUser = localStorage.getItem("token") ? localStorage.getItem("token") : null;

        let headers = {};

        if (body && !(body instanceof FormData)) {
            headers["content-type"] = "application/json";
        }

        const tokenToUse = token || authUser;
        if (tokenToUse) {
            headers.Authorization = `Bearer ${tokenToUse}`;
        }

        let response = await axios({
            url: `${API_URL}/${endpoint}`,
            method,
            data: body,
            headers,
            responseType,
            timeout: 300000,
        });

        return response;
    } catch (e) {
        if (e.response?.status === 401) {
            showNotification("Session expired. Please log in.", "error");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        }

        // Throw error with message from response if available
        const errorMsg = e.response?.data?.message || e.response?.data?.data?.message || "API CALL Failed";
        throw new Error(errorMsg);
    }
}
