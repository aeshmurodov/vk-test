// src/api/users.ts
import axios from 'axios';
import { User, NewUserFormData } from '../types';

const API_BASE_URL = 'http://localhost:3001'; // JSON Server runs on port 3001 by default

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<{ users: User[]; totalCount: number }> => {
  const response = await apiClient.get(`/users?_page=${page}&_limit=${limit}`);
  // json-server adds X-Total-Count header for total number of resources
  const totalCount = parseInt(response.headers['x-total-count'], 10);
  return { users: response.data, totalCount };
};

export const addUser = async (userData: NewUserFormData): Promise<User> => {
  const response = await apiClient.post('/users', {
    ...userData,
    id: Date.now().toString(), // Simple unique ID for mock
    joinedDate: new Date().toISOString().split('T')[0], // Current date
  });
  return response.data;
};