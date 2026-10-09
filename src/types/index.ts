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

export interface ResourceInput {
  name: string;
  description?: string | null;
  capacity?: number;
}

export interface CreateBookingInput {
  user_id: number;
  resource_id: number;
  start_time: string;
  end_time: string;
}