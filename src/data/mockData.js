// ===================== PROPERTIES =====================
export const properties = [
    {
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
    {
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
];

// ===================== TENANTS =====================
export const tenants = [
    { id: 'T001', name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@gmail.com', property: 'Sunrise PG', floor: '1st Floor', room: '101', bed: 'A', moveIn: '2025-06-15', rent: 8000, deposit: 16000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543211' },
    { id: 'T002', name: 'Priya Patel', phone: '9876543212', email: 'priya@gmail.com', property: 'Sunrise PG', floor: '1st Floor', room: '101', bed: 'B', moveIn: '2025-07-01', rent: 7500, deposit: 15000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543213' },
    { id: 'T003', name: 'Amit Kumar', phone: '9876543214', email: 'amit@gmail.com', property: 'Sunrise PG', floor: '1st Floor', room: '102', bed: 'A', moveIn: '2025-08-10', rent: 8000, deposit: 16000, kycStatus: 'Pending', appStatus: 'Inactive', stayType: 'Monthly', lockIn: 3, noticePeriod: 15, idProof: 'PAN', emergencyContact: '9876543215' },
    { id: 'T004', name: 'Sneha Reddy', phone: '9876543216', email: 'sneha@gmail.com', property: 'Sunrise PG', floor: '2nd Floor', room: '201', bed: 'A', moveIn: '2025-09-01', rent: 8500, deposit: 17000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543217' },
    { id: 'T005', name: 'Vikram Singh', phone: '9876543218', email: 'vikram@gmail.com', property: 'Sunrise PG', floor: '2nd Floor', room: '201', bed: 'B', moveIn: '2025-09-15', rent: 8500, deposit: 17000, kycStatus: 'Rejected', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Passport', emergencyContact: '9876543219' },
    { id: 'T006', name: 'Ananya Gupta', phone: '9876543220', email: 'ananya@gmail.com', property: 'Sunrise PG', floor: '2nd Floor', room: '202', bed: 'A', moveIn: '2025-10-01', rent: 7500, deposit: 15000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 12, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543221' },
    { id: 'T007', name: 'Ravi Teja', phone: '9876543222', email: 'ravi@gmail.com', property: 'Green Valley PG', floor: '1st Floor', room: '101', bed: 'A', moveIn: '2025-07-20', rent: 7000, deposit: 14000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543223' },
    { id: 'T008', name: 'Kavitha Nair', phone: '9876543224', email: 'kavitha@gmail.com', property: 'Green Valley PG', floor: '1st Floor', room: '101', bed: 'B', moveIn: '2025-08-05', rent: 7000, deposit: 14000, kycStatus: 'Pending', appStatus: 'Inactive', stayType: 'Monthly', lockIn: 3, noticePeriod: 15, idProof: 'DL', emergencyContact: '9876543225' },
    { id: 'T009', name: 'Suresh Babu', phone: '9876543226', email: 'suresh@gmail.com', property: 'Green Valley PG', floor: '2nd Floor', room: '201', bed: 'A', moveIn: '2025-11-01', rent: 7500, deposit: 15000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543227' },
    { id: 'T010', name: 'Deepika Joshi', phone: '9876543228', email: 'deepika@gmail.com', property: 'Sunrise PG', floor: '3rd Floor', room: '301', bed: 'A', moveIn: '2026-01-10', rent: 9000, deposit: 18000, kycStatus: 'Verified', appStatus: 'Active', stayType: 'Monthly', lockIn: 6, noticePeriod: 30, idProof: 'Aadhaar', emergencyContact: '9876543229' },
];

// ===================== DUES =====================
export const dues = [
    { id: 'D001', tenantId: 'T001', tenant: 'Rahul Sharma', room: '101', bed: 'A', type: 'Rent', amount: 8000, dueDate: '2026-02-01', status: 'Unpaid', property: 'Sunrise PG' },
    { id: 'D002', tenantId: 'T003', tenant: 'Amit Kumar', room: '102', bed: 'A', type: 'Rent', amount: 8000, dueDate: '2026-02-01', status: 'Unpaid', property: 'Sunrise PG' },
    { id: 'D003', tenantId: 'T005', tenant: 'Vikram Singh', room: '201', bed: 'B', type: 'Electricity', amount: 1200, dueDate: '2026-02-05', status: 'Unpaid', property: 'Sunrise PG' },
    { id: 'D004', tenantId: 'T002', tenant: 'Priya Patel', room: '101', bed: 'B', type: 'Maintenance', amount: 500, dueDate: '2026-02-01', status: 'Overdue', property: 'Sunrise PG' },
    { id: 'D005', tenantId: 'T006', tenant: 'Ananya Gupta', room: '202', bed: 'A', type: 'Rent', amount: 7500, dueDate: '2026-02-01', status: 'Paid', property: 'Sunrise PG' },
    { id: 'D006', tenantId: 'T007', tenant: 'Ravi Teja', room: '101', bed: 'A', type: 'Rent', amount: 7000, dueDate: '2026-02-01', status: 'Unpaid', property: 'Green Valley PG' },
    { id: 'D007', tenantId: 'T008', tenant: 'Kavitha Nair', room: '101', bed: 'B', type: 'Water', amount: 300, dueDate: '2026-02-05', status: 'Paid', property: 'Green Valley PG' },
    { id: 'D008', tenantId: 'T009', tenant: 'Suresh Babu', room: '201', bed: 'A', type: 'Rent', amount: 7500, dueDate: '2026-02-01', status: 'Unpaid', property: 'Green Valley PG' },
    { id: 'D009', tenantId: 'T010', tenant: 'Deepika Joshi', room: '301', bed: 'A', type: 'Electricity', amount: 950, dueDate: '2026-02-05', status: 'Overdue', property: 'Sunrise PG' },
    { id: 'D010', tenantId: 'T004', tenant: 'Sneha Reddy', room: '201', bed: 'A', type: 'Rent', amount: 8500, dueDate: '2026-02-01', status: 'Paid', property: 'Sunrise PG' },
];

// ===================== COLLECTIONS =====================
export const collections = [
    { id: 'C001', date: '2026-02-01', tenant: 'Ananya Gupta', room: '202', amount: 7500, mode: 'UPI', receivedBy: 'Admin', receipt: 'RCP001', property: 'Sunrise PG' },
    { id: 'C002', date: '2026-02-01', tenant: 'Sneha Reddy', room: '201', amount: 8500, mode: 'Cash', receivedBy: 'Admin', receipt: 'RCP002', property: 'Sunrise PG' },
    { id: 'C003', date: '2026-02-02', tenant: 'Kavitha Nair', room: '101', amount: 300, mode: 'UPI', receivedBy: 'Manager', receipt: 'RCP003', property: 'Green Valley PG' },
    { id: 'C004', date: '2026-01-28', tenant: 'Rahul Sharma', room: '101', amount: 8000, mode: 'Bank Transfer', receivedBy: 'Admin', receipt: 'RCP004', property: 'Sunrise PG' },
    { id: 'C005', date: '2026-01-30', tenant: 'Ravi Teja', room: '101', amount: 7000, mode: 'Cash', receivedBy: 'Admin', receipt: 'RCP005', property: 'Green Valley PG' },
    { id: 'C006', date: '2026-01-25', tenant: 'Deepika Joshi', room: '301', amount: 9000, mode: 'UPI', receivedBy: 'Admin', receipt: 'RCP006', property: 'Sunrise PG' },
    { id: 'C007', date: '2026-02-03', tenant: 'Priya Patel', room: '101', amount: 7500, mode: 'Cash', receivedBy: 'Manager', receipt: 'RCP007', property: 'Sunrise PG' },
    { id: 'C008', date: '2026-02-05', tenant: 'Suresh Babu', room: '201', amount: 7500, mode: 'UPI', receivedBy: 'Admin', receipt: 'RCP008', property: 'Green Valley PG' },
];

// ===================== EXPENSES =====================
export const expenses = [
    { id: 'E001', date: '2026-02-01', category: 'Salary', description: 'Cook salary - Feb', amount: 12000, property: 'Sunrise PG', receipt: true },
    { id: 'E002', date: '2026-02-01', category: 'Salary', description: 'Watchman salary - Feb', amount: 8000, property: 'Sunrise PG', receipt: true },
    { id: 'E003', date: '2026-02-03', category: 'Maintenance', description: 'Plumbing repair - 2nd floor', amount: 2500, property: 'Sunrise PG', receipt: false },
    { id: 'E004', date: '2026-02-04', category: 'Food', description: 'Monthly groceries', amount: 18000, property: 'Sunrise PG', receipt: true },
    { id: 'E005', date: '2026-02-01', category: 'Rent', description: 'Building rent - Feb', amount: 45000, property: 'Sunrise PG', receipt: true },
    { id: 'E006', date: '2026-02-02', category: 'Electricity', description: 'Electricity bill - Jan', amount: 8500, property: 'Sunrise PG', receipt: true },
    { id: 'E007', date: '2026-02-01', category: 'Salary', description: 'Cleaner salary - Feb', amount: 6000, property: 'Green Valley PG', receipt: true },
    { id: 'E008', date: '2026-02-05', category: 'Maintenance', description: 'AC service - all rooms', amount: 4500, property: 'Green Valley PG', receipt: false },
    { id: 'E009', date: '2026-02-06', category: 'Others', description: 'WiFi recharge - Feb', amount: 2000, property: 'Sunrise PG', receipt: true },
    { id: 'E010', date: '2026-02-01', category: 'Rent', description: 'Building rent - Feb', amount: 30000, property: 'Green Valley PG', receipt: true },
];

// ===================== DUES PACKAGES =====================
export const duesPackages = [
    { id: 'DP001', name: 'Rent', type: 'Fixed', amount: 8000, enabled: true, description: 'Monthly room rent' },
    { id: 'DP002', name: 'Maintenance', type: 'Fixed', amount: 500, enabled: true, description: 'Monthly maintenance charge' },
    { id: 'DP003', name: 'Electricity', type: 'Variable', amount: null, enabled: true, description: 'Per unit electricity charge' },
    { id: 'DP004', name: 'Water', type: 'Fixed', amount: 300, enabled: true, description: 'Monthly water charge' },
    { id: 'DP005', name: 'Food', type: 'Fixed', amount: 3500, enabled: false, description: 'Monthly food/mess charge' },
    { id: 'DP006', name: 'Joining Fee', type: 'Fixed', amount: 1000, enabled: false, description: 'One-time joining fee' },
    { id: 'DP007', name: 'Security Deposit', type: 'Variable', amount: null, enabled: true, description: 'Refundable security deposit' },
    { id: 'DP008', name: 'Laundry', type: 'Fixed', amount: 500, enabled: false, description: 'Monthly laundry service' },
];

// ===================== BOOKINGS =====================
export const bookings = [
    { id: 'B001', name: 'Arjun Mehta', phone: '9988776655', property: 'Sunrise PG', room: '301-B', bookingDate: '2026-02-10', moveInDate: '2026-03-01', amount: 8000, advancePaid: 4000, status: 'Confirmed' },
    { id: 'B002', name: 'Nisha Agarwal', phone: '9988776656', property: 'Green Valley PG', room: '201-B', bookingDate: '2026-02-08', moveInDate: '2026-02-20', amount: 7000, advancePaid: 3500, status: 'Pending' },
    { id: 'B003', name: 'Rohit Das', phone: '9988776657', property: 'Sunrise PG', room: '102-B', bookingDate: '2026-02-05', moveInDate: '2026-02-15', amount: 8000, advancePaid: 0, status: 'Cancelled' },
    { id: 'B004', name: 'Meera Rao', phone: '9988776658', property: 'Green Valley PG', room: '102-A', bookingDate: '2026-02-12', moveInDate: '2026-03-05', amount: 7000, advancePaid: 7000, status: 'Confirmed' },
];

// ===================== OLD TENANTS =====================
export const oldTenants = [
    { id: 'OT001', name: 'Kiran Rao', phone: '9876500001', property: 'Sunrise PG', room: '103', moveIn: '2024-06-01', moveOut: '2025-12-31', totalStay: '18 months', pendingDues: 0, pendingAmount: 0, settlement: 'Fully Settled', depositRefunded: true },
    { id: 'OT002', name: 'Neha Varma', phone: '9876500002', property: 'Green Valley PG', room: '102', moveIn: '2025-01-15', moveOut: '2025-11-15', totalStay: '10 months', pendingDues: 2500, pendingAmount: 2500, settlement: 'Pending Settlement', depositRefunded: false },
    { id: 'OT003', name: 'Arjun Patel', phone: '9876500003', property: 'Sunrise PG', room: '201', moveIn: '2024-09-01', moveOut: '2025-08-31', totalStay: '12 months', pendingDues: 0, pendingAmount: 0, settlement: 'Fully Settled', depositRefunded: true },
];

// ===================== STAFF =====================
export const staff = [
    { id: 'S001', name: 'Rajesh Kumar', phone: '9876500010', role: 'Manager', property: 'Sunrise PG', salary: 15000, joinDate: '2024-01-15', status: 'Active' },
    { id: 'S002', name: 'Lakshmi Devi', phone: '9876500011', role: 'Cook', property: 'Sunrise PG', salary: 12000, joinDate: '2024-03-01', status: 'Active' },
    { id: 'S003', name: 'Ramu Naik', phone: '9876500012', role: 'Watchman', property: 'Sunrise PG', salary: 8000, joinDate: '2024-06-01', status: 'Active' },
    { id: 'S004', name: 'Savitha', phone: '9876500013', role: 'Cleaner', property: 'Green Valley PG', salary: 6000, joinDate: '2025-01-10', status: 'Active' },
    { id: 'S005', name: 'Venkat Rao', phone: '9876500014', role: 'Manager', property: 'Green Valley PG', salary: 14000, joinDate: '2024-08-01', status: 'Active' },
];

// ===================== COMPLAINTS =====================
export const complaints = [
    { id: 'CMP001', tenant: 'Rahul Sharma', room: '101', category: 'Plumbing', description: 'Leaking tap in bathroom', status: 'Open', priority: 'High', date: '2026-02-10', property: 'Sunrise PG' },
    { id: 'CMP002', tenant: 'Priya Patel', room: '101', category: 'Electrical', description: 'Fan not working', status: 'In Progress', priority: 'Medium', date: '2026-02-08', property: 'Sunrise PG' },
    { id: 'CMP003', tenant: 'Ravi Teja', room: '101', category: 'Pest Control', description: 'Cockroach issue in kitchen', status: 'Resolved', priority: 'Low', date: '2026-02-05', property: 'Green Valley PG' },
    { id: 'CMP004', tenant: 'Suresh Babu', room: '201', category: 'WiFi', description: 'Internet speed very slow', status: 'Open', priority: 'Medium', date: '2026-02-11', property: 'Green Valley PG' },
    { id: 'CMP005', tenant: 'Deepika Joshi', room: '301', category: 'Furniture', description: 'Bed frame broken', status: 'Open', priority: 'High', date: '2026-02-12', property: 'Sunrise PG' },
];

// ===================== ROOMS =====================
export const rooms = [
    { id: 'R001', number: '101', floor: '1st Floor', property: 'Sunrise PG', beds: 3, occupiedBeds: 2, type: 'Triple Sharing', rent: 8000, status: 'Partially Occupied', amenities: ['AC', 'WiFi', 'Attached Bathroom'] },
    { id: 'R002', number: '102', floor: '1st Floor', property: 'Sunrise PG', beds: 3, occupiedBeds: 1, type: 'Triple Sharing', rent: 8000, status: 'Partially Occupied', amenities: ['AC', 'WiFi', 'Attached Bathroom'] },
    { id: 'R003', number: '103', floor: '1st Floor', property: 'Sunrise PG', beds: 2, occupiedBeds: 0, type: 'Double Sharing', rent: 9000, status: 'Vacant', amenities: ['AC', 'WiFi', 'Attached Bathroom', 'Balcony'] },
    { id: 'R004', number: '201', floor: '2nd Floor', property: 'Sunrise PG', beds: 3, occupiedBeds: 2, type: 'Triple Sharing', rent: 8500, status: 'Partially Occupied', amenities: ['AC', 'WiFi', 'Attached Bathroom'] },
    { id: 'R005', number: '202', floor: '2nd Floor', property: 'Sunrise PG', beds: 3, occupiedBeds: 1, type: 'Triple Sharing', rent: 7500, status: 'Partially Occupied', amenities: ['AC', 'WiFi'] },
    { id: 'R006', number: '203', floor: '2nd Floor', property: 'Sunrise PG', beds: 1, occupiedBeds: 0, type: 'Single', rent: 12000, status: 'Vacant', amenities: ['AC', 'WiFi', 'Attached Bathroom', 'Balcony', 'TV'] },
    { id: 'R007', number: '301', floor: '3rd Floor', property: 'Sunrise PG', beds: 3, occupiedBeds: 1, type: 'Triple Sharing', rent: 9000, status: 'Partially Occupied', amenities: ['AC', 'WiFi', 'Attached Bathroom'] },
    { id: 'R008', number: '302', floor: '3rd Floor', property: 'Sunrise PG', beds: 2, occupiedBeds: 2, type: 'Double Sharing', rent: 10000, status: 'Full', amenities: ['AC', 'WiFi', 'Attached Bathroom', 'Balcony'] },
    { id: 'R009', number: '101', floor: '1st Floor', property: 'Green Valley PG', beds: 3, occupiedBeds: 2, type: 'Triple Sharing', rent: 7000, status: 'Partially Occupied', amenities: ['AC', 'WiFi'] },
    { id: 'R010', number: '102', floor: '1st Floor', property: 'Green Valley PG', beds: 3, occupiedBeds: 0, type: 'Triple Sharing', rent: 7000, status: 'Vacant', amenities: ['AC', 'WiFi'] },
    { id: 'R011', number: '201', floor: '2nd Floor', property: 'Green Valley PG', beds: 3, occupiedBeds: 1, type: 'Triple Sharing', rent: 7500, status: 'Partially Occupied', amenities: ['AC', 'WiFi', 'Attached Bathroom'] },
    { id: 'R012', number: '202', floor: '2nd Floor', property: 'Green Valley PG', beds: 2, occupiedBeds: 2, type: 'Double Sharing', rent: 8000, status: 'Full', amenities: ['AC', 'WiFi', 'Attached Bathroom'] },
];

// ===================== SUMMARY HELPERS =====================
export function getDashboardSummary() {
    const totalCollection = collections.reduce((sum, c) => sum + c.amount, 0);
    const unpaidDues = dues.filter(d => d.status !== 'Paid');
    const totalUnpaid = unpaidDues.reduce((sum, d) => sum + d.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const defaulters = new Set(unpaidDues.filter(d => d.status === 'Overdue').map(d => d.tenantId)).size;
    const totalDeposit = tenants.reduce((sum, t) => sum + t.deposit, 0);
    const todayCollection = collections.filter(c => c.date === '2026-02-13').reduce((sum, c) => sum + c.amount, 0);

    return {
        todayCollection,
        monthlyCollection: totalCollection,
        monthlyDues: totalUnpaid,
        totalDues: totalUnpaid,
        monthlyExpenses: totalExpenses,
        rentDefaulters: defaulters,
        currentDeposits: totalDeposit,
    };
}
