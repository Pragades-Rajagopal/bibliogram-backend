export interface SaveUserRequest {
  fullname: string;
  username: string;
  privateKey: string;
  role?: "user" | "admin";
  createdOn?: string;
}

export interface GeneratePrivateKey {
  privateKey: string | null;
  hashedPKey: string | null;
}
