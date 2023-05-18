import { randomBytes } from "crypto";

export default function generateSecret() {
  const buffer = randomBytes(32);
  const apiKey = buffer.toString("base64");
  return apiKey;
}
