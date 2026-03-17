import axios from "axios";
import {BASE_URL} from "../constants.js"

const axiosInstance = axios.create();

axiosInstance.defaults.baseURL = `${BASE_URL}/api/v1`;
axiosInstance.defaults.withCredentials = true;  // ✅ This tells axios to send cookies

export default axiosInstance;