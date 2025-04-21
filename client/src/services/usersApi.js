import axios from 'axios';

const usersApi = axios.create({
  baseURL: 'http://localhost:8888/api/users',
});

usersApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default usersApi;
