import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/dues/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const due = await prisma.due.findUnique({
            where: { id },
            include: {
                tenant: true
            }
        });
        if (!due) return NextResponse.json({ error: 'Due not found' }, { status: 404 });
        return NextResponse.json(due);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/dues/[id] - Update Status/Amount
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const due = await prisma.due.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(due);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/dues/[id]
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.due.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Due deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
