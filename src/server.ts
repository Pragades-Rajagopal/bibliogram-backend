import "dotenv/config";
import express, { Express, Request, Response } from "express";
const app: Express = express();
import router from "./routes/common.route";

let PORT: any = process.env.PORT || 8080;

app.use(express.json());
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`app is running in port:${PORT}`);
});
