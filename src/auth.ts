import HttpStatus from "http-status-codes";
import { Request, Response, NextFunction } from "express";

export default function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { API_KEY } = process.env;
  if (!API_KEY) return next();

  if (req.query.token !== API_KEY) {
    return res.status(HttpStatus.UNAUTHORIZED).send({ error: "Unauthorized" });
  }

  return next();
}
