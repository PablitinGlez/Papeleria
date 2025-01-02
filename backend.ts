export type UserRole = 'admin' | 'sales' | 'manager';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
}

export const users: User[] = [
  {
    id: 1,
    name: 'Admin',
    roles: ['admin'],
    email: 'admin@gmail.com',
  },
  {
    id: 2,
    name: 'Bob',
    roles: ['sales', 'manager'],
    email: 'bob@gmail.com',
  },
  {
    id: 3,
    name: 'Charlie',
    roles: ['manager'],
    email: 'charlie@gmail.com',
  },
  {
    id: 4,
    name: 'David',
    roles: ['sales'],
    email: 'david@gmail.com',
  },
];
