// src/types/index.ts
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    city: string;
    occupation: string;
    status: 'Активен' | 'Неактивен';
    joinedDate: string;
  }
  
  export type NewUserFormData = Omit<User, 'id'>;
  
  export interface UsersResponse {
    data: User[];
    totalCount: number; // Assuming json-server will provide X-Total-Count header
  }