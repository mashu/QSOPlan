import axios from 'axios';

// Ensure we have a valid base URL, throw an error if not configured
const baseURL = process.env.NEXT_PUBLIC_API_URL;
if (!baseURL) {
  console.error('NEXT_PUBLIC_API_URL environment variable is not configured');
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor for debugging (optional)
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});

// Add response interceptor for debugging (optional)
api.interceptors.response.use(
  response => {
    console.log('Response:', response.status);
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;
