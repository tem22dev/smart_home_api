export interface IPayload {
  sub: string;
  iss: string;
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  roles: string[];
  tokenVersion: number;
}
