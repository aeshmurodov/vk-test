// tests/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getUsers, addUser } from '../src/api/users'; // Adjust path if needed
import { User, NewUserFormData } from '../src/types'; // Adjust path if needed

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('API Functions (Asynchronous Operations)', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
  });

  it('should fetch users with pagination and total count', async () => {
    const mockUsers: User[] = [
      { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', age: 30, city: 'City', occupation: 'Dev', status: 'Активен', joinedDate: '2023-01-01' },
      { id: '2', firstName: 'Another', lastName: 'One', email: 'another@example.com', age: 25, city: 'Town', occupation: 'QA', status: 'Неактивен', joinedDate: '2023-01-02' },
    ];
    const totalCount = 50;

    mockedAxios.get.mockResolvedValueOnce({
      data: mockUsers,
      headers: { 'x-total-count': totalCount.toString() },
      status: 200,
      statusText: 'OK',
      config: {},
      request: {},
    });

    const page = 1;
    const limit = 10;
    const result = await getUsers(page, limit);

    expect(mockedAxios.get).toHaveBeenCalledWith(`http://localhost:3001/users?_page=${page}&_limit=${limit}`);
    expect(result.users).toEqual(mockUsers);
    expect(result.totalCount).toBe(totalCount);
  });

  it('should add a new user and return the created user', async () => {
    const newUserFormData: NewUserFormData = {
      firstName: 'New',
      lastName: 'Person',
      email: 'new.person@example.com',
      age: 28,
      city: 'Village',
      occupation: 'Artist',
      status: 'Активен',
      joinedDate: '2023-11-20', // This will be overwritten by the API function
    };
    const createdUser: User = { ...newUserFormData, id: 'some-generated-id', joinedDate: '2023-11-20' }; // The API function will generate id and date

    mockedAxios.post.mockResolvedValueOnce({
      data: createdUser,
      status: 201,
      statusText: 'Created',
      config: {},
      request: {},
    });

    const result = await addUser(newUserFormData);

    expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3001/users', expect.any(Object));
    // We expect the returned data to match the mock, but the id and joinedDate are dynamically generated
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('joinedDate');
    expect(result.firstName).toBe(newUserFormData.firstName);
    // ... check other properties
  });

  it('should handle API errors when fetching users', async () => {
    const errorMessage = 'Network Error';
    mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

    await expect(getUsers()).rejects.toThrow(errorMessage);
  });
});