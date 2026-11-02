export interface User {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
