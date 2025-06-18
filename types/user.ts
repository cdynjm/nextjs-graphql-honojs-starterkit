export interface User {
  id: number;
  encrypted_id: string;
  name: string;
  email: string;
  password: string;
  role: number;
  photo: string;
  created_at: string;
  updated_at: string;
}