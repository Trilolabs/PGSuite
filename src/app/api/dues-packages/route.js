import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/dues-packages?propertyId=PROP001
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    try {
        const where = propertyId ? { propertyId } : {};
        const packages = await prisma.duesPackage.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(packages);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/dues-packages
export async function POST(request) {
    try {
        const body = await request.json();
        const pkg = await prisma.duesPackage.create({
            data: {
                name: body.name,
                type: body.type,
                amount: body.amount,
                frequency: body.frequency || "Monthly",
                deposit: body.deposit || 0,
                active: body.active !== undefined ? body.active : true,
                description: body.description,
                propertyId: body.propertyId || "PROP001",
            },
        });
        return NextResponse.json(pkg, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
