import { db } from '../../config/database';
import { UsersTable, referralTable } from '../../models/schema';
import { eq, isNull, sql, and, ilike, count } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export class AdminReferralService {
    static async getReferralTree(
        parentId?: string,
        search?: string,
        page: number = 1,
        limit: number = 10
    ) {
        const offset = (page - 1) * limit;

        // We need to check if each user has children to determine if they are expandable
        // Subquery to count children for each user
        const childCount = db
            .select({
                refer_by: referralTable.refer_by,
                count: count(referralTable.id).as('count'),
            })
            .from(referralTable)
            .groupBy(referralTable.refer_by)
            .as('child_count');

        let query = db
            .select({
                id: UsersTable.id,
                name: UsersTable.name,
                email: UsersTable.email,
                phone: UsersTable.phone,
                profile: UsersTable.profile,
                referral_code: UsersTable.referral_code,
                referral_by: UsersTable.referral_by,
                created_at: UsersTable.created_at,
                children_count: sql<number>`COALESCE(${childCount.count}, 0)`,
            })
            .from(UsersTable)
            .leftJoin(childCount, eq(UsersTable.id, childCount.refer_by));

        // Conditions
        const conditions = [];

        if (search) {
            conditions.push(
                sql`(${UsersTable.name} ILIKE ${`%${search}%`} OR ${UsersTable.email} ILIKE ${`%${search}%`} OR ${UsersTable.referral_code} ILIKE ${`%${search}%`})`
            );
        }

        if (parentId) {
            // If parentId is provided, we want users referred by this parent
            // We need to join with referralTable to find children
            // But wait, UsersTable has referral_by (code), not id.
            // referralTable has refer_by (uuid) and referred (uuid).
            // So we should use referralTable to find children of parentId.

            // Let's adjust the query structure for parentId case vs root case

            // Actually, let's use the referralTable to filter.
            // We want users who are in referralTable where refer_by = parentId

            // But we are selecting from UsersTable.
            // So we need to join referralTable on UsersTable.id = referralTable.referred
            // AND referralTable.refer_by = parentId

            const r = alias(referralTable, 'r');
            query.innerJoin(r, eq(UsersTable.id, r.referred));
            conditions.push(eq(r.refer_by, parentId));

        } else {
            // If no parentId, we want roots.
            // Roots are users who have NO referrer.
            // In UsersTable, referral_by is null or empty.
            if (!search) {
                conditions.push(sql`(${UsersTable.referral_by} IS NULL OR ${UsersTable.referral_by} = '')`);
            }
            // If search is provided, we search globally, not just roots.
        }

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        // Pagination
        const results = await query
            .limit(limit)
            .offset(offset);

        // Get total count for pagination
        // This is a bit expensive, maybe optimize later if needed
        // Re-construct query for count
        let countQuery = db
            .select({ count: count(UsersTable.id) })
            .from(UsersTable);

        if (parentId) {
            const r = alias(referralTable, 'r');
            countQuery.innerJoin(r, eq(UsersTable.id, r.referred));
        }

        // Apply same where conditions
        if (conditions.length > 0) {
            countQuery.where(and(...conditions));
        }

        const totalResult = await countQuery;
        const total = Number(totalResult[0]?.count || 0);

        return {
            data: results.map(user => ({
                ...user,
                has_children: Number(user.children_count) > 0
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
