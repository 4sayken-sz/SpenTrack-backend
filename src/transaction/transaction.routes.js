import {createTransaction, updateTransaction, deleteTransaction, readTransaction} from "./transaction.controller.js";
import {Router} from "express";
import {adminUserGuard} from "../middlewares/authGuard.middleware.js";

const transactionRouter = Router();

transactionRouter.post("/addTransaction", adminUserGuard, createTransaction);
transactionRouter.get("/getTransactions", adminUserGuard, readTransaction);
transactionRouter.put("/updateTransaction/:id", adminUserGuard, updateTransaction);
transactionRouter.delete("/removeTransaction/:id", adminUserGuard, deleteTransaction);

export default transactionRouter;