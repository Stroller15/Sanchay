export interface User {
  id: string;
  providerId: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "admin" | "member";
