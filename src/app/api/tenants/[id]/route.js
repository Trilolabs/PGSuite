import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/tenants/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id },
            include: {
                room: true,
                dues: true,
                collections: true,
                complaints: true,
            }
        });
        if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        return NextResponse.json(tenant);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/tenants/[id]
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const tenant = await prisma.tenant.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(tenant);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/tenants/[id] - Move to OldTenant then Delete
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        // 1. Get tenant details
        const tenant = await prisma.tenant.findUnique({
            where: { id },
            include: { room: true }
        });

        if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

        // 2. Create OldTenant record
        await prisma.oldTenant.create({
            data: {
                name: tenant.name,
                phone: tenant.phone,
                room: tenant.room ? tenant.room.number : '',
                moveIn: tenant.moveIn,
                moveOut: new Date().toISOString().split('T')[0], // Today's date
                totalStay: 'Unknown', // Could calculate from moveIn date
                pendingDues: 0, // Should calculate from Dues table
                pendingAmount: 0,
                settlement: 'Pending Settlement',
                depositRefunded: false,
                propertyId: tenant.propertyId
            }
        });

        // 3. Delete Tenant
        await prisma.tenant.delete({
            where: { id },
        });

        // 4. Update Room occupancy
        if (tenant.roomId) {
            await prisma.room.update({
                where: { id: tenant.roomId },
                data: {
                    occupiedBeds: { decrement: 1 }
                }
            });
        }

        // 5. Update Property Stats
        await prisma.property.update({
            where: { id: tenant.propertyId },
            data: {
                activeTenants: { decrement: 1 },
                occupiedBeds: { decrement: 1 }
            }
        });

        return NextResponse.json({ message: 'Tenant moved to archive and deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
