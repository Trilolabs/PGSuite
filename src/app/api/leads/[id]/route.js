import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/leads/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const lead = await prisma.lead.findUnique({
            where: { id },
        });
        if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        return NextResponse.json(lead);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/leads/[id]
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const lead = await prisma.lead.update({
            where: { id },
            data: body,
        });

        // If converted to tenant, we might want to trigger tenant creation side-effect 
        // or just let the frontend handle calling POST /api/tenants with lead data.
        // Frontend logic is preferred for flexibility.

        return NextResponse.json(lead);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/leads/[id]
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.lead.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Lead deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
