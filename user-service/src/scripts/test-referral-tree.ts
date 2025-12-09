import { AdminReferralService } from '../services/admin/referral.service';
import { connectDatabase, disconnectDatabase } from '../config/database';

async function testReferralTree() {
    await connectDatabase();

    try {
        console.log('--- Testing Root Level (No Parent ID) ---');
        const roots = await AdminReferralService.getReferralTree();
        console.log('Roots found:', roots.data.length);
        if (roots.data.length > 0) {
            console.log('First root:', roots.data[0].name, 'Has children:', roots.data[0].has_children);

            if (roots.data[0].has_children) {
                const parentId = roots.data[0].id;
                console.log(`\n--- Testing Children of ${roots.data[0].name} (${parentId}) ---`);
                const children = await AdminReferralService.getReferralTree(parentId);
                console.log('Children found:', children.data.length);
                if (children.data.length > 0) {
                    console.log('First child:', children.data[0].name);
                }
            }
        } else {
            console.log('No roots found. Database might be empty or no referral data.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await disconnectDatabase();
    }
}

testReferralTree();
