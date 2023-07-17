import crypto from "crypto";

export default function hashPassword(password: string, salt: string) {
  const hashedPwd = crypto
    .createHmac("sha256", salt)
    .update(password)
    .digest("hex");
  return hashedPwd;
}
