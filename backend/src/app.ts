import express, {type Request, type Response} from "express";
import AuthRoutes from './routes/AuthRoutes.js'
const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("server is running;");
});

app.use("/api/auth", AuthRoutes)

export default app;
