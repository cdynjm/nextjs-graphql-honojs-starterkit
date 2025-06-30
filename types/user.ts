export interface User {
  _id: string;
  encrypted_id: string;
  name: string;
  email: string;
  password: string;
  role: {
    _id: string,
    name: string
  };
  photo: string;
  created_at: Date;
  updated_at: Date;
  posts?: {
    encrypted_id: string;
    status: string;
    created_at: Date;
    updated_at: Date;
  }[];
}
