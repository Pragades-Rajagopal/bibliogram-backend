export interface SaveUserRequest {
  fullname: string;
  username: string;
  privateKey: string;
  status: number;
  createdOn: string;
}

export interface GeneratePrivateKey {
  privateKey: string | null;
  hashedPKey: string | null;
}
