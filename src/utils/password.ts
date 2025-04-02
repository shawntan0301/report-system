// src/utils/password.ts
import bcrypt from "bcrypt";

export async function saltAndHashPassword(password: string) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}
