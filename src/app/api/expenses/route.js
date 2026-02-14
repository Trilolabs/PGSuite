import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/expenses?propertyId=PROP001&category=Salary&from=2026-02-01&to=2026-02-28
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const category = searchParams.get('category');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    try {
        const where = {};
        if (propertyId) where.propertyId = propertyId;
        if (category) where.category = category;
        if (from || to) {
            where.date = {};
            if (from) where.date.gte = from;
            if (to) where.date.lte = to;
        }

        const expenses = await prisma.expense.findMany({
            where,
            orderBy: { date: 'desc' },
        });
        return NextResponse.json(expenses);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/expenses
export async function POST(request) {
    try {
        const body = await request.json();
        const expense = await prisma.expense.create({
            data: body,
        });
        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
