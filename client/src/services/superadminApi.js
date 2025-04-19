import axios from 'axios';

const superadminApi = axios.create({
  baseURL: 'http://localhost:8888/api/superadmin',
});

superadminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default superadminApi;
