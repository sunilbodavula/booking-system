export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
  created_at: Date;
}

export interface Resource {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  created_at: Date;
}

export interface Booking {
  id: number;
  user_id: number;
  resource_id: number;
  start_time: Date;
  end_time: Date;
  status: 'CONFIRMED' | 'CANCELLED';
  created_at: Date;
}

export type { 
  ResourceInput, 
  CreateBookingInput,
  ResourceListQuery,
  BookingListQuery
} from '../validation/schema';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type  Role = 'ADMIN' | 'USER';

export interface AuthUser {
  id: number;
  role: Role;
}

export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role' | 'created_at'>;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
} 