// explication 

////         IMPORT      ////
import  { Router } from "express";
import { createForm } from "../controllers/formsController.js";

const router = Router();
////    routes  /////
router.post("/", createForm);

router.get("/", (_req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
