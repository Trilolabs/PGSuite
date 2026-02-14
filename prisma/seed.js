const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.lead.deleteMany();
    await prisma.complaint.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.due.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.duesPackage.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.oldTenant.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.room.deleteMany();
    await prisma.property.deleteMany();
    console.log('  Cleared existing data');

    // ===================== PROPERTIES =====================
    const prop1 = await prisma.property.create({
        data: {
            id: 'PROP001',
            name: 'Sunrise PG',
            code: '5000724104A',
            totalRooms: 12,
            totalBeds: 36,
            occupiedBeds: 28,
            activeTenants: 28,
            underNotice: 2,
            pendingDues: 15400,
            collection: 168000,
            floors: 3,
            address: 'Plot 45, Madhapur, Hyderabad',
            type: 'Co-living',
            gender: 'Male',
        },
    });
    const prop2 = await prisma.property.create({
        data: {
            id: 'PROP002',
            name: 'Green Valley PG',
            code: '5000724104B',
            totalRooms: 8,
            totalBeds: 24,
            occupiedBeds: 20,
            activeTenants: 20,
            underNotice: 1,
            pendingDues: 8200,
            collection: 120000,
            floors: 2,
            address: '12-A, Gachibowli, Hyderabad',
            type: 'PG',
            gender: 'Female',
        },
    });
    console.log('  ✅ Properties seeded');

    // ===================== ROOMS =====================
    const roomsData = [
        { id: 'R001', number: '101', floor: '1st Floor', propertyId: 'PROP001', beds: 3, occupiedBeds: 2, type: 'Triple Sharing', rent: 8000, status: 'Partially Occupied', amenities: '["AC","WiFi","Attached Bathroom"]' },
        { id: 'R002', number: '102', floor: '1st Floor', propertyId: 'PROP001', beds: 3, occupiedBeds: 1, type: 'Triple Sharing', rent: 8000, status: 'Partially Occupied', amenities: '["AC","WiFi","Attached Bathroom"]' },
        { id: 'R003', number: '103', floor: '1st Floor', propertyId: 'PROP001', beds: 2, occupiedBeds: 0, type: 'Double Sharing', rent: 9000, status: 'Vacant', amenities: '["AC","WiFi","Attached Bathroom","Balcony"]' },
        { id: 'R004', number: '201', floor: '2nd Floor', propertyId: 'PROP001', beds: 3, occupiedBeds: 2, type: 'Triple Sharing', rent: 8500, status: 'Partially Occupied', amenities: '["AC","WiFi","Attached Bathroom"]' },
        { id: 'R005', number: '202', floor: '2nd Floor', propertyId: 'PROP001', beds: 3, occupiedBeds: 1, type: 'Triple Sharing', rent: 7500, status: 'Partially Occupied', amenities: '["AC","WiFi"]' },
        { id: 'R006', number: '203', floor: '2nd Floor', propertyId: 'PROP001', beds: 1, occupiedBeds: 0, type: 'Single', rent: 12000, status: 'Vacant', amenities: '["AC","WiFi","Attached Bathroom","Balcony","TV"]' },
        { id: 'R007', number: '301', floor: '3rd Floor', propertyId: 'PROP001', beds: 3, occupiedBeds: 1, type: 'Triple Sharing', rent: 9000, status: 'Partially Occupied', amenities: '["AC","WiFi","Attached Bathroom"]' },
        { id: 'R008', number: '302', floor: '3rd Floor', propertyId: 'PROP001', beds: 2, occupiedBeds: 2, type: 'Double Sharing', rent: 10000, status: 'Full', amenities: '["AC","WiFi","Attached Bathroom","Balcony"]' },
        { id: 'R009', number: '101', floor: '1st Floor', propertyId: 'PROP002', beds: 3, occupiedBeds: 2, type: 'Triple Sharing', rent: 7000, status: 'Partially Occupied', amenities: '["AC","WiFi"]' },
        { id: 'R010', number: '102', floor: '1st Floor', propertyId: 'PROP002', beds: 3, occupiedBeds: 0, type: 'Triple Sharing', rent: 7000, status: 'Vacant', amenities: '["AC","WiFi"]' },
        { id: 'R011', number: '201', floor: '2nd Floor', propertyId: 'PROP002', beds: 3, occupiedBeds: 1, type: 'Triple Sharing', rent: 7500, status: 'Partially Occupied', amenities: '["AC","WiFi","Attached Bathroom"]' },
        { id: 'R012', number: '202', floor: '2nd Floor', propertyId: 'PROP002', beds: 2, occupiedBeds: 2, type: 'Double Sharing', rent: 8000, status: 'Full', amenities: '["AC","WiFi","Attached Bathroom"]' },
    ];
    for (const r of roomsData) {
        await prisma.room.create({ data: r });
    }
    console.log('  ✅ Rooms seeded');

    // ===================== TENANTS =====================
    const tenantsData = [
        { id: 'T001', name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@gmail.com', propertyId: 'PROP001', roomId: 'R001', floor: '1st Floor', bed: 'A', moveIn: '2025-06-15', rent: 8000, deposit: 16000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543211' },
        { id: 'T002', name: 'Priya Patel', phone: '9876543212', email: 'priya@gmail.com', propertyId: 'PROP001', roomId: 'R001', floor: '1st Floor', bed: 'B', moveIn: '2025-07-01', rent: 7500, deposit: 15000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543213' },
        { id: 'T003', name: 'Amit Kumar', phone: '9876543214', email: 'amit@gmail.com', propertyId: 'PROP001', roomId: 'R002', floor: '1st Floor', bed: 'A', moveIn: '2025-08-10', rent: 8000, deposit: 16000, kycStatus: 'Pending', appStatus: 'Inactive', stayType: 'Monthly', lockIn: 3, noticePeriod: 15, idProof: 'PAN', emergencyContact: '9876543215' },
        { id: 'T004', name: 'Sneha Reddy', phone: '9876543216', email: 'sneha@gmail.com', propertyId: 'PROP001', roomId: 'R004', floor: '2nd Floor', bed: 'A', moveIn: '2025-09-01', rent: 8500, deposit: 17000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543217' },
        { id: 'T005', name: 'Vikram Singh', phone: '9876543218', email: 'vikram@gmail.com', propertyId: 'PROP001', roomId: 'R004', floor: '2nd Floor', bed: 'B', moveIn: '2025-09-15', rent: 8500, deposit: 17000, kycStatus: 'Rejected', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Passport', emergencyContact: '9876543219' },
        { id: 'T006', name: 'Ananya Gupta', phone: '9876543220', email: 'ananya@gmail.com', propertyId: 'PROP001', roomId: 'R005', floor: '2nd Floor', bed: 'A', moveIn: '2025-10-01', rent: 7500, deposit: 15000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 12, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543221' },
        { id: 'T007', name: 'Ravi Teja', phone: '9876543222', email: 'ravi@gmail.com', propertyId: 'PROP002', roomId: 'R009', floor: '1st Floor', bed: 'A', moveIn: '2025-07-20', rent: 7000, deposit: 14000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543223' },
        { id: 'T008', name: 'Kavitha Nair', phone: '9876543224', email: 'kavitha@gmail.com', propertyId: 'PROP002', roomId: 'R009', floor: '1st Floor', bed: 'B', moveIn: '2025-08-05', rent: 7000, deposit: 14000, kycStatus: 'Pending', appStatus: 'Inactive', stayType: 'Monthly', lockIn: 3, noticePeriod: 15, idProof: 'DL', emergencyContact: '9876543225' },
        { id: 'T009', name: 'Suresh Babu', phone: '9876543226', email: 'suresh@gmail.com', propertyId: 'PROP002', roomId: 'R011', floor: '2nd Floor', bed: 'A', moveIn: '2025-11-01', rent: 7500, deposit: 15000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543227' },
        { id: 'T010', name: 'Deepika Joshi', phone: '9876543228', email: 'deepika@gmail.com', propertyId: 'PROP001', roomId: 'R007', floor: '3rd Floor', bed: 'A', moveIn: '2026-01-10', rent: 9000, deposit: 18000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543229' },
    ];
    for (const t of tenantsData) {
        await prisma.tenant.create({ data: t });
    }
    console.log('  ✅ Tenants seeded');

    // ===================== DUES =====================
    const duesData = [
        { id: 'D001', tenantId: 'T001', type: 'Rent', amount: 8000, dueDate: '2026-02-01', status: 'Unpaid', propertyId: 'PROP001' },
        { id: 'D002', tenantId: 'T003', type: 'Rent', amount: 8000, dueDate: '2026-02-01', status: 'Unpaid', propertyId: 'PROP001' },
        { id: 'D003', tenantId: 'T005', type: 'Electricity', amount: 1200, dueDate: '2026-02-05', status: 'Unpaid', propertyId: 'PROP001' },
        { id: 'D004', tenantId: 'T002', type: 'Maintenance', amount: 500, dueDate: '2026-02-01', status: 'Overdue', propertyId: 'PROP001' },
        { id: 'D005', tenantId: 'T006', type: 'Rent', amount: 7500, dueDate: '2026-02-01', status: 'Paid', propertyId: 'PROP001' },
        { id: 'D006', tenantId: 'T007', type: 'Rent', amount: 7000, dueDate: '2026-02-01', status: 'Unpaid', propertyId: 'PROP002' },
        { id: 'D007', tenantId: 'T008', type: 'Water', amount: 300, dueDate: '2026-02-05', status: 'Paid', propertyId: 'PROP002' },
        { id: 'D008', tenantId: 'T009', type: 'Rent', amount: 7500, dueDate: '2026-02-01', status: 'Unpaid', propertyId: 'PROP002' },
        { id: 'D009', tenantId: 'T010', type: 'Electricity', amount: 950, dueDate: '2026-02-05', status: 'Overdue', propertyId: 'PROP001' },
        { id: 'D010', tenantId: 'T004', type: 'Rent', amount: 8500, dueDate: '2026-02-01', status: 'Paid', propertyId: 'PROP001' },
    ];
    for (const d of duesData) {
        await prisma.due.create({ data: d });
    }
    console.log('  ✅ Dues seeded');

    // ===================== COLLECTIONS =====================
    const collectionsData = [
        { id: 'C001', date: '2026-02-01', tenantId: 'T006', amount: 7500, mode: 'UPI', receivedBy: 'Admin', receipt: 'RCP001', propertyId: 'PROP001' },
        { id: 'C002', date: '2026-02-01', tenantId: 'T004', amount: 8500, mode: 'Cash', receivedBy: 'Admin', receipt: 'RCP002', propertyId: 'PROP001' },
        { id: 'C003', date: '2026-02-02', tenantId: 'T008', amount: 300, mode: 'UPI', receivedBy: 'Manager', receipt: 'RCP003', propertyId: 'PROP002' },
        { id: 'C004', date: '2026-01-28', tenantId: 'T001', amount: 8000, mode: 'Bank Transfer', receivedBy: 'Admin', receipt: 'RCP004', propertyId: 'PROP001' },
        { id: 'C005', date: '2026-01-30', tenantId: 'T007', amount: 7000, mode: 'Cash', receivedBy: 'Admin', receipt: 'RCP005', propertyId: 'PROP002' },
        { id: 'C006', date: '2026-01-25', tenantId: 'T010', amount: 9000, mode: 'UPI', receivedBy: 'Admin', receipt: 'RCP006', propertyId: 'PROP001' },
        { id: 'C007', date: '2026-02-03', tenantId: 'T002', amount: 7500, mode: 'Cash', receivedBy: 'Manager', receipt: 'RCP007', propertyId: 'PROP001' },
        { id: 'C008', date: '2026-02-05', tenantId: 'T009', amount: 7500, mode: 'UPI', receivedBy: 'Admin', receipt: 'RCP008', propertyId: 'PROP002' },
    ];
    for (const c of collectionsData) {
        await prisma.collection.create({ data: c });
    }
    console.log('  ✅ Collections seeded');

    // ===================== EXPENSES =====================
    const expensesData = [
        { id: 'E001', date: '2026-02-01', category: 'Salary', description: 'Cook salary - Feb', amount: 12000, propertyId: 'PROP001', hasReceipt: true },
        { id: 'E002', date: '2026-02-01', category: 'Salary', description: 'Watchman salary - Feb', amount: 8000, propertyId: 'PROP001', hasReceipt: true },
        { id: 'E003', date: '2026-02-03', category: 'Maintenance', description: 'Plumbing repair - 2nd floor', amount: 2500, propertyId: 'PROP001', hasReceipt: false },
        { id: 'E004', date: '2026-02-04', category: 'Food', description: 'Monthly groceries', amount: 18000, propertyId: 'PROP001', hasReceipt: true },
        { id: 'E005', date: '2026-02-01', category: 'Rent', description: 'Building rent - Feb', amount: 45000, propertyId: 'PROP001', hasReceipt: true },
        { id: 'E006', date: '2026-02-02', category: 'Electricity', description: 'Electricity bill - Jan', amount: 8500, propertyId: 'PROP001', hasReceipt: true },
        { id: 'E007', date: '2026-02-01', category: 'Salary', description: 'Cleaner salary - Feb', amount: 6000, propertyId: 'PROP002', hasReceipt: true },
        { id: 'E008', date: '2026-02-05', category: 'Maintenance', description: 'AC service - all rooms', amount: 4500, propertyId: 'PROP002', hasReceipt: false },
        { id: 'E009', date: '2026-02-06', category: 'Others', description: 'WiFi recharge - Feb', amount: 2000, propertyId: 'PROP001', hasReceipt: true },
        { id: 'E010', date: '2026-02-01', category: 'Rent', description: 'Building rent - Feb', amount: 30000, propertyId: 'PROP002', hasReceipt: true },
    ];
    for (const e of expensesData) {
        await prisma.expense.create({ data: e });
    }
    console.log('  ✅ Expenses seeded');

    // ===================== DUES PACKAGES =====================
    const duesPackagesData = [
        { id: 'DP001', name: 'Rent', type: 'Fixed', amount: 8000, active: true, status: 'Active', description: 'Monthly room rent', propertyId: 'PROP001' },
        { id: 'DP002', name: 'Maintenance', type: 'Fixed', amount: 500, active: true, status: 'Active', description: 'Monthly maintenance charge', propertyId: 'PROP001' },
        { id: 'DP003', name: 'Electricity', type: 'Variable', amount: null, active: true, status: 'Active', description: 'Per unit electricity charge', propertyId: 'PROP001' },
        { id: 'DP004', name: 'Water', type: 'Fixed', amount: 300, active: true, status: 'Active', description: 'Monthly water charge', propertyId: 'PROP001' },
        { id: 'DP005', name: 'Food', type: 'Fixed', amount: 3500, active: false, status: 'Inactive', description: 'Monthly food/mess charge', propertyId: 'PROP001' },
        { id: 'DP006', name: 'Joining Fee', type: 'Fixed', amount: 1000, active: false, status: 'Inactive', description: 'One-time joining fee', propertyId: 'PROP001' },
        { id: 'DP007', name: 'Security Deposit', type: 'Variable', amount: null, active: true, status: 'Active', description: 'Refundable security deposit', propertyId: 'PROP001' },
        { id: 'DP008', name: 'Laundry', type: 'Fixed', amount: 500, active: false, status: 'Inactive', description: 'Monthly laundry service', propertyId: 'PROP001' },
    ];
    for (const dp of duesPackagesData) {
        await prisma.duesPackage.create({ data: dp });
    }
    console.log('  ✅ Dues Packages seeded');

    // ===================== BOOKINGS =====================
    const bookingsData = [
        { id: 'B001', name: 'Arjun Mehta', phone: '9988776655', propertyId: 'PROP001', room: '301-B', bookingDate: '2026-02-10', moveInDate: '2026-03-01', amount: 8000, advancePaid: 4000, status: 'Confirmed' },
        { id: 'B002', name: 'Nisha Agarwal', phone: '9988776656', propertyId: 'PROP002', room: '201-B', bookingDate: '2026-02-08', moveInDate: '2026-02-20', amount: 7000, advancePaid: 3500, status: 'Pending' },
        { id: 'B003', name: 'Rohit Das', phone: '9988776657', propertyId: 'PROP001', room: '102-B', bookingDate: '2026-02-05', moveInDate: '2026-02-15', amount: 8000, advancePaid: 0, status: 'Cancelled' },
        { id: 'B004', name: 'Meera Rao', phone: '9988776658', propertyId: 'PROP002', room: '102-A', bookingDate: '2026-02-12', moveInDate: '2026-03-05', amount: 7000, advancePaid: 7000, status: 'Confirmed' },
    ];
    for (const b of bookingsData) {
        await prisma.booking.create({ data: b });
    }
    console.log('  ✅ Bookings seeded');

    // ===================== OLD TENANTS =====================
    const oldTenantsData = [
        { id: 'OT001', name: 'Kiran Rao', phone: '9876500001', propertyId: 'PROP001', room: '103', moveIn: '2024-06-01', moveOut: '2025-12-31', totalStay: '18 months', pendingDues: 0, pendingAmount: 0, settlement: 'Fully Settled', depositRefunded: true },
        { id: 'OT002', name: 'Neha Varma', phone: '9876500002', propertyId: 'PROP002', room: '102', moveIn: '2025-01-15', moveOut: '2025-11-15', totalStay: '10 months', pendingDues: 2500, pendingAmount: 2500, settlement: 'Pending Settlement', depositRefunded: false },
        { id: 'OT003', name: 'Arjun Patel', phone: '9876500003', propertyId: 'PROP001', room: '201', moveIn: '2024-09-01', moveOut: '2025-08-31', totalStay: '12 months', pendingDues: 0, pendingAmount: 0, settlement: 'Fully Settled', depositRefunded: true },
    ];
    for (const ot of oldTenantsData) {
        await prisma.oldTenant.create({ data: ot });
    }
    console.log('  ✅ Old Tenants seeded');

    // ===================== STAFF =====================
    const staffData = [
        { id: 'S001', name: 'Rajesh Kumar', phone: '9876500010', role: 'Manager', propertyId: 'PROP001', salary: 15000, joinDate: '2024-01-15', status: 'Active' },
        { id: 'S002', name: 'Lakshmi Devi', phone: '9876500011', role: 'Cook', propertyId: 'PROP001', salary: 12000, joinDate: '2024-03-01', status: 'Active' },
        { id: 'S003', name: 'Ramu Naik', phone: '9876500012', role: 'Watchman', propertyId: 'PROP001', salary: 8000, joinDate: '2024-06-01', status: 'Active' },
        { id: 'S004', name: 'Savitha', phone: '9876500013', role: 'Cleaner', propertyId: 'PROP002', salary: 6000, joinDate: '2025-01-10', status: 'Active' },
        { id: 'S005', name: 'Venkat Rao', phone: '9876500014', role: 'Manager', propertyId: 'PROP002', salary: 14000, joinDate: '2024-08-01', status: 'Active' },
    ];
    for (const s of staffData) {
        await prisma.staff.create({ data: s });
    }
    console.log('  ✅ Staff seeded');

    // ===================== COMPLAINTS =====================
    const complaintsData = [
        { id: 'CMP001', tenantId: 'T001', category: 'Plumbing', description: 'Leaking tap in bathroom', status: 'Open', priority: 'High', date: '2026-02-10', propertyId: 'PROP001', room: '101' },
        { id: 'CMP002', tenantId: 'T002', category: 'Electrical', description: 'Fan not working', status: 'In Progress', priority: 'Medium', date: '2026-02-08', propertyId: 'PROP001', room: '101' },
        { id: 'CMP003', tenantId: 'T007', category: 'Pest Control', description: 'Cockroach issue in kitchen', status: 'Resolved', priority: 'Low', date: '2026-02-05', propertyId: 'PROP002', room: '101' },
        { id: 'CMP004', tenantId: 'T009', category: 'WiFi', description: 'Internet speed very slow', status: 'Open', priority: 'Medium', date: '2026-02-11', propertyId: 'PROP002', room: '201' },
        { id: 'CMP005', tenantId: 'T010', category: 'Furniture', description: 'Bed frame broken', status: 'Open', priority: 'High', date: '2026-02-12', propertyId: 'PROP001', room: '301' },
    ];
    for (const c of complaintsData) {
        await prisma.complaint.create({ data: c });
    }
    console.log('  ✅ Complaints seeded');

    // ===================== LEADS =====================
    const leadsData = [
        { id: 'L001', name: 'Rajesh M.', phone: '9876543210', budget: '₹7,000-₹9,000', sharing: 'Double', facilities: 'AC, WiFi', status: 'New', source: 'Website', addedOn: '2026-02-10', propertyId: 'PROP001' },
        { id: 'L002', name: 'Supriya K.', phone: '9876543211', budget: '₹8,000-₹10,000', sharing: 'Single', facilities: 'AC, WiFi, TV', status: 'Follow Up', source: 'Walk-in', addedOn: '2026-02-08', propertyId: 'PROP001' },
        { id: 'L003', name: 'Vinod P.', phone: '9876543212', budget: '₹6,000-₹8,000', sharing: 'Triple', facilities: 'WiFi', status: 'Converted', source: 'Instagram', addedOn: '2026-02-05', propertyId: 'PROP001' },
        { id: 'L004', name: 'Anita D.', phone: '9876543213', budget: '₹9,000-₹12,000', sharing: 'Single', facilities: 'AC, WiFi, Balcony', status: 'Visit Done', source: 'Referral', addedOn: '2026-02-03', propertyId: 'PROP001' },
        { id: 'L005', name: 'Karthik R.', phone: '9876543214', budget: '₹7,000-₹8,000', sharing: 'Double', facilities: 'AC', status: 'Call Pending', source: 'Facebook', addedOn: '2026-01-28', propertyId: 'PROP001' },
    ];
    for (const l of leadsData) {
        await prisma.lead.create({ data: l });
    }
    console.log('  ✅ Leads seeded');

    console.log('\n🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
