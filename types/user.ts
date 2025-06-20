export interface User {
  _id: string;
  encrypted_id: string;
  name: string;
  email: string;
  password: string;
  role: number;
  photo: string;
  created_at: Date;
  updated_at: Date;
}
