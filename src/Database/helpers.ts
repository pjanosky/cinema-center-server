import { User } from "./types";

export function removingPassword(user: User) {
  const userCopy = structuredClone(user);
  delete userCopy.password;
  return userCopy;
}
