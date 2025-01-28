export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthPayload {
  token: string;
  user: User;
  role: string;
}
