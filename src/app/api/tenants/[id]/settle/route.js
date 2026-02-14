import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/tenants/[id]/settle
export async function POST(request, { params }) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { moveOutDate, deductions, pendingDues, pendingAmount, settlement } = body;

        // 1. Get Tenant details
        const tenant = await prisma.tenant.findUnique({
            where: { id },
            include: { room: true }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        const result = await prisma.$transaction(async (prisma) => {
            // 2. Create OldTenant Record
            const oldTenant = await prisma.oldTenant.create({
                data: {
                    name: tenant.name,
                    phone: tenant.phone,
                    room: tenant.room ? tenant.room.number : 'Unknown',
                    moveIn: tenant.moveIn,
                    moveOut: moveOutDate,
                    totalStay: calculateDuration(tenant.moveIn, moveOutDate),
                    pendingDues: parseFloat(pendingDues || 0),
                    pendingAmount: parseFloat(pendingAmount || 0),
                    settlement: settlement,
                    depositRefunded: false, // Default
                    propertyId: tenant.propertyId,
                }
            });

            // 3. Update Room (Free up bed)
            if (tenant.roomId) {
                // Decrement occupied beds
                const room = await prisma.room.findUnique({ where: { id: tenant.roomId } });
                if (room && room.occupiedBeds > 0) {
                    const newOccupancy = room.occupiedBeds - 1;
                    await prisma.room.update({
                        where: { id: tenant.roomId },
                        data: {
                            occupiedBeds: newOccupancy,
                            status: newOccupancy === 0 ? 'Vacant' : 'Occupied' // Or Partial? Simplified for now
                        }
                    });
                }
            }

            // 4. Delete Tenant Record
            await prisma.tenant.delete({
                where: { id: id }
            });

            return oldTenant;
        });

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function calculateDuration(start, end) {
    if (!start || !end) return 'Unknown';
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return `${months}m ${days}d`;
}
