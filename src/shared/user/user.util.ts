import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

export const getHashPassword = (password: string): string => {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
};

export const isValidPassword = (password: string, hash: string): boolean => {
  return compareSync(password, hash);
};
