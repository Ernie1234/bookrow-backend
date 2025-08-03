import { Router } from "express";
import authRoute from "./authRoute";
import bookRoute from "./bookRoute";

const apiRouter: Router = Router();

apiRouter.use("/auth", authRoute);
apiRouter.use("/book", bookRoute);

export default apiRouter;
