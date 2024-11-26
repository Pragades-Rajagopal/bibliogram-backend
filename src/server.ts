import express, { Express, Request, Response } from "express";
const app: Express = express();

app.use(express.json());

app.get("/", (_: Request, response: Response): any => {
  return response.status(200).json({ message: "All good" });
});

app.listen(8000, () => console.log("app is running"));
