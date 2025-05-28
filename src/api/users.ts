// src/api/users.ts
import axios from 'axios';
import { type User, type NewUserFormData } from '../types';

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
  // Add sortColumn and sortOrder, making them optional as sorting might not always be applied
  sortColumn: keyof User | undefined = undefined,
  sortOrder: 'asc' | 'desc' | undefined = undefined
): Promise<{ users: User[]; totalCount: number }> => {
  // Use _limit for items per page as per json-server pagination
  let url = `/users?_page=${page}&_per_page=${limit}`;

  // Add sorting parameters if provided
  if (sortColumn && sortOrder) {
    url += `&_sort=${String(sortColumn)}&_order=${sortOrder}`; // Corrected: Use _order for sort direction
  }

  const response = await apiClient.get(url);

  // JSON Server sends the total count in the 'X-Total-Count' header
  const totalCountHeader = response.data['items'];
  let totalCount = parseInt(totalCountHeader, 10);

  // Fallback if X-Total-Count header is missing or invalid (though json-server usually provides it)
  if (isNaN(totalCount)) {
      console.warn("Items in data is missing or invalid. Falling back to data length for totalCount.");
      totalCount = response.data.length; 
  }
  
  // JSON Server returns the array of resources directly in response.data
  return { users: response.data.data, totalCount };
};

export const addUser = async (userData: NewUserFormData): Promise<User> => {
  // For json-server, it's best practice to let the server generate the ID
  // for new resources. Just send the data without an 'id' field.
  const newUser = {
    ...userData,
    joinedDate: new Date().toISOString().split('T')[0], // Current date
  };

  const addResponse = await apiClient.post('/users', newUser);
  return addResponse.data; // json-server will return the new user with its generated ID
};