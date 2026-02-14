import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/tenants?propertyId=PROP001&roomId=R001
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const roomId = searchParams.get('roomId');

    try {
        const where = {};
        if (propertyId) where.propertyId = propertyId;
        if (roomId) where.roomId = roomId;

        const tenants = await prisma.tenant.findMany({
            where,
            orderBy: { name: 'asc' },
            include: {
                room: {
                    select: { number: true }
                }
            }
        });
        return NextResponse.json(tenants);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/tenants
export async function POST(request) {
    try {
        const body = await request.json();

        // Check for duplicate phone
        const existingTenant = await prisma.tenant.findFirst({
            where: { phone: body.phone }
        });

        if (existingTenant) {
            return NextResponse.json({ error: 'Tenant with this phone number already exists.' }, { status: 400 });
        }

        const {
            name, phone, email,
            propertyId, roomId, bed, floor,
            stayType, moveIn, moveOut, noticePeriod, lockIn, agreementPeriod,
            rent, deposit, maintenance, joiningFee, rentalFrequency, rentStartDate,
            electricityType, electricityRate,
            tenantType, dob, gender, bloodGroup, foodPreference,
            openingBalance, paymentMode,
            remarks, nationality, gstNo, gstAddress,
            fatherName, fatherPhone, motherName, motherPhone,
            guardianName, guardianPhone,
            bankName, accountNumber, ifscCode,
            bookedBy, referredBy,
            alternatePhone, // Keep alternatePhone for emergencyContact
            photo, fatherOccupation, motherOccupation, upiId,
            meterNumber, initialMeterReading, documents
        } = body;

        // Basic Validation
        if (!name || !phone || !propertyId || !roomId || !moveIn || !rent) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const tenant = await prisma.tenant.create({
            data: {
                name, phone, email,
                propertyId, roomId, bed, floor,
                stayType, moveIn, moveOut, noticePeriod, lockIn, agreementPeriod,
                rent: parseFloat(rent) || 0,
                deposit: parseFloat(deposit) || 0,
                maintenance: parseFloat(maintenance) || 0,
                joiningFee: parseFloat(joiningFee) || 0,
                rentalFrequency: rentalFrequency || "Monthly",
                rentStartDate: String(rentStartDate || "1"),
                electricityType: electricityType || "Submeter",
                electricityRate: parseFloat(electricityRate) || 0,
                tenantType: tenantType || "Student",
                dob, gender, bloodGroup, foodPreference,
                openingBalance: parseFloat(openingBalance) || 0,
                paymentMode: paymentMode || "Cash",
                remarks: remarks || "",
                nationality: nationality || "Indian",
                gstNo: gstNo || "",
                gstAddress: gstAddress || "",
                fatherName: fatherName || "",
                fatherPhone: fatherPhone || "",
                motherName: motherName || "",
                motherPhone: motherPhone || "",
                guardianName: guardianName || "",
                guardianPhone: guardianPhone || "",
                bankName: bankName || "",
                accountNumber: accountNumber || "",
                ifscCode: ifscCode || "",
                tenantType: tenantType || "Student",
                bookedBy: bookedBy || "",
                referredBy: referredBy || "",

                rent: parseFloat(body.rent) || 0,
                deposit: parseFloat(body.deposit) || 0,
                maintenance: parseFloat(body.maintenance) || 0,
                joiningFee: parseFloat(body.joiningFee) || 0,
                electricityRate: parseFloat(body.electricityRate) || 0,
                openingBalance: parseFloat(body.openingBalance) || 0,
                rentStartDate: String(body.rentStartDate || "1"),
                lockIn: parseInt(body.lockIn) || 0,
                noticePeriod: parseInt(body.noticePeriod) || 30,
                photo: photo || "",
                fatherOccupation: fatherOccupation || "",
                motherOccupation: motherOccupation || "",
                upiId: upiId || "",
                meterNumber: meterNumber || "",
                initialMeterReading: parseFloat(initialMeterReading) || 0,
                documents: JSON.stringify(documents || []),
            },
        });

        // If room is assigned, update room occupancy? 
        // For now we trust the frontend/business logic to handle room updates separately 
        // or we can add a transaction here if strict consistency is needed.
        // Given the scope, simple create is fine for now, but Room occupiedBeds should ideally be updated.

        if (tenant.roomId) {
            await prisma.room.update({
                where: { id: tenant.roomId },
                data: {
                    occupiedBeds: { increment: 1 }
                }
            });
        }

        // Update property active tenants count
        if (tenant.propertyId) {
            await prisma.property.update({
                where: { id: tenant.propertyId },
                data: {
                    activeTenants: { increment: 1 },
                    occupiedBeds: { increment: 1 }
                }
            });
        }

        return NextResponse.json(tenant, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
