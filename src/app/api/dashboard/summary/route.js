import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/dashboard/summary
export async function GET() {
    try {
        // 1. Property Stats
        const totalProperties = await prisma.property.count();

        // 2. Room/Bed Stats
        const bedStats = await prisma.room.aggregate({
            _sum: {
                beds: true,
                occupiedBeds: true
            }
        });
        const totalBeds = bedStats._sum.beds || 0;
        const occupiedBeds = bedStats._sum.occupiedBeds || 0;
        const availableBeds = totalBeds - occupiedBeds;

        // 3. Tenant Stats
        const activeTenants = await prisma.tenant.count({
            where: { appStatus: 'Active' }
        });

        // 4. Financial Stats
        const pendingDues = await prisma.due.aggregate({
            where: { status: 'Unpaid' },
            _sum: { amount: true }
        });

        // Get first day of current month
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];

        const monthlyCollection = await prisma.collection.aggregate({
            where: {
                date: { gte: firstDay }
            },
            _sum: { amount: true }
        });

        const monthlyExpense = await prisma.expense.aggregate({
            where: {
                date: { gte: firstDay }
            },
            _sum: { amount: true }
        });

        // 5. Operations Stats
        const openComplaints = await prisma.complaint.count({
            where: { status: { not: 'Resolved' } } // Open or In Progress
        });

        const newLeads = await prisma.lead.count({
            where: { status: 'New' }
        });

        return NextResponse.json({
            totalProperties,
            totalBeds,
            occupiedBeds,
            availableBeds,
            activeTenants,
            financial: {
                pendingDues: pendingDues._sum.amount || 0,
                monthlyCollection: monthlyCollection._sum.amount || 0,
                monthlyExpense: monthlyExpense._sum.amount || 0
            },
            operations: {
                openComplaints,
                newLeads
            }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
