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
  limit: number = 10,
  sortColumn: keyof User | null = null, // Add sortColumn
  sortOrder: 'asc' | 'desc' = 'asc' // Add sortOrder
): Promise<{ users: User[]; totalCount: number }> => {
  let url = `/users?_page=${page}&_per_page=${limit}`;

  if (sortColumn) {
    url += `&_sort=${String(sortColumn)}&_per_page=${sortOrder}`;
  }

  const response = await apiClient.get(url);

  const totalCountHeader = response.data['items'];
  let totalCount = parseInt(totalCountHeader, 10);

  if (isNaN(totalCount) || !totalCountHeader) {
      console.warn("Items value missing or invalid. Falling back to data length for totalCount.");
      totalCount = response.data.length
  }
  
  return { users: response.data.data, totalCount };
};

export const addUser = async (userData: NewUserFormData): Promise<User> => {
  const response = await apiClient.post('/users', {
    ...userData,
    id: Date.now().toString(), // Simple unique ID for mock
    joinedDate: new Date().toISOString().split('T')[0], // Current date
  });
  return response.data;
};