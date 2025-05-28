// tests/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getUsers, addUser } from '../src/api/users'; // Adjust path if needed
import { User, NewUserFormData } from '../src/types'; // Adjust path if needed

// Mock axios
vi.mock('axios', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
      create: vi.fn().mockReturnThis(),
      interceptors: {
        request: {
          use: vi.fn(),
          eject: vi.fn(),
        },
        response: {
          use: vi.fn(),
          eject: vi.fn(),
        },
      },
    },
  };
});

const mockedAxios = vi.mocked(axios, true); // deep mock

describe('API Functions (Asynchronous Operations)', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
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

    expect(mockedAxios.post).toHaveBeenCalledWith('/users', expect.any(Object));
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('joinedDate');
    expect(result.firstName).toBe(newUserFormData.firstName);
  });

  it('should handle API errors when fetching users', async () => {
    const errorMessage = 'Network Error';
    mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

    await expect(getUsers()).rejects.toThrow(errorMessage);
  });
});