import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/expenses/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const expense = await prisma.expense.findUnique({
            where: { id },
        });
        if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        return NextResponse.json(expense);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/expenses/[id]
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const expense = await prisma.expense.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(expense);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/expenses/[id]
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.expense.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Expense deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
