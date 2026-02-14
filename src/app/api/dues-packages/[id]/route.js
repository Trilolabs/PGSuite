import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/dues-packages/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const pkg = await prisma.duesPackage.findUnique({
            where: { id },
        });
        if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
        return NextResponse.json(pkg);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/dues-packages/[id]
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const pkg = await prisma.duesPackage.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(pkg);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/dues-packages/[id]
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.duesPackage.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Package deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
