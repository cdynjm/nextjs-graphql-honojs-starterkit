import jwt from "jsonwebtoken";

export const signJwt = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "2h" });
};