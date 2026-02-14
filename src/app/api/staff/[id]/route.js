import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/staff/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const staffMember = await prisma.staff.findUnique({
            where: { id },
        });
        if (!staffMember) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        return NextResponse.json(staffMember);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/staff/[id]
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const staffMember = await prisma.staff.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(staffMember);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/staff/[id]
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.staff.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Staff deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
