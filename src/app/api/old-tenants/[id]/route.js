import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/old-tenants/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const oldTenant = await prisma.oldTenant.findUnique({
            where: { id },
        });
        if (!oldTenant) return NextResponse.json({ error: 'Old Tenant not found' }, { status: 404 });
        return NextResponse.json(oldTenant);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/old-tenants/[id]
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const oldTenant = await prisma.oldTenant.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(oldTenant);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/old-tenants/[id]
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.oldTenant.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Old Tenant deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
