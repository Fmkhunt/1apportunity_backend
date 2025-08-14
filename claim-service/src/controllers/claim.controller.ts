import { Request, Response, NextFunction } from 'express';
import { ClaimService } from '../services/claim.service';
import { ResponseHandler } from '../utils/responseHandler';
import { TCreateClaimData, TUpdateClaimData, TClaimQueryParams, TAuthenticatedAdminRequest } from '../types';

export class ClaimController {
  /**
   * Create a new claim
   */
  static async create(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const claimData: TCreateClaimData = req.body;
      const result = await ClaimService.create(claimData);

      ResponseHandler.created(res, result, "Claim created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all claims with pagination and filtering
   */
  static async getAll(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: TClaimQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        claim_type: req.query.claim_type as string | undefined,
        search: req.query.search as string | undefined,
      };

      const result = await ClaimService.getAll(queryParams);

      ResponseHandler.success(res, result, "Claims retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get claim by ID
   */
  static async getById(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { claimId } = req.params;

      const claim = await ClaimService.getById(claimId);

      if (!claim) {
        ResponseHandler.notFound(res, "Claim not found");
        return;
      }

      ResponseHandler.success(res, claim, "Claim retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update claim by ID
   */
  static async update(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { claimId } = req.params;
      const updateData: TUpdateClaimData = req.body;
      const result = await ClaimService.update(claimId, updateData);

      ResponseHandler.success(res, result, "Claim updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete claim by ID
   */
  static async delete(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { claimId } = req.params;

      await ClaimService.delete(claimId);

      ResponseHandler.success(res, {}, "Claim deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get claims by type
   */
  static async getByType(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { claimType } = req.params;

      const claims = await ClaimService.getByType(claimType);

      ResponseHandler.success(res, claims, "Claims retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
} 