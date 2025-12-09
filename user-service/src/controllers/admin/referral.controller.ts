import { Request, Response } from 'express';
import { AdminReferralService } from '../../services/admin/referral.service';
import { ResponseHandler } from '../../utils/responseHandler';
import { catchAsync } from '../../utils/catchAsync';

export class AdminReferralController {
    static getReferralTree = catchAsync(async (req: Request, res: Response) => {
        const { parentId, search, page, limit } = req.query;

        const result = await AdminReferralService.getReferralTree(
            parentId as string,
            search as string,
            page ? Number(page) : 1,
            limit ? Number(limit) : 10
        );

        ResponseHandler.success(res, result, 'Referral tree fetched successfully');
    });
}
