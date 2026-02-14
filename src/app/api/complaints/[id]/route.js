import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/complaints/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: { tenant: true }
        });
        if (!complaint) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        return NextResponse.json(complaint);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/complaints/[id]
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const complaint = await prisma.complaint.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(complaint);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/complaints/[id]
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.complaint.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Complaint deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
