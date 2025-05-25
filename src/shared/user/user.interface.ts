export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  age: number;
  gender: number;
  roles: string[];
}

export interface IUserFull extends IUser {
  refreshToken: string;
  createdBy: {
    _id: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    email: string;
  };
  deletedBy: {
    _id: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt: Date;
}
