import { Router } from "express";

import {  createAsset,
  getAssets,
  getAsset,
  updateAsset,
  deleteAsset } from "../controllers/asset.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateBody, validateParams } from "../middleware/validator.middleware.js";
import {
  assetIdValidator,
  createAssetValidator,
  updateAssetValidator,
} from "../validators/asset.validator.js";

const router = Router();

router.use(protect);

router.post("/", restrictTo("admin"), validateBody(createAssetValidator), createAsset);
router.get("/", getAssets);
router.get("/:id", validateParams(assetIdValidator), getAsset);
router.put("/:id", restrictTo("admin"), validateParams(assetIdValidator), validateBody(updateAssetValidator), updateAsset);
router.delete("/:id", restrictTo("admin"), validateParams(assetIdValidator), deleteAsset);

export default router;
