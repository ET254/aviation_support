import { Router } from "express";

import { DecisionSupportController } from "../controllers/decisionSupport.controller";

const router = Router();

router.get(
    "/station/:stationId",
    DecisionSupportController.evaluateStation
);

router.post(
    "/evaluate",
    DecisionSupportController.evaluateObservation
);

router.get(
    "/dashboard/:stationId",
    DecisionSupportController.dashboard
);

export default router;