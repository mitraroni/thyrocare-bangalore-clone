import { db } from '@/db';
import { appointments } from '@/db/schema';

async function main() {
    const now = new Date().toISOString();
    
    // Helper function to generate appointment dates for next 7-15 days
    const getRandomAppointmentDate = () => {
        const today = new Date();
        const daysFromNow = Math.floor(Math.random() * 8) + 7; // 7-15 days
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + daysFromNow);
        return appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    // Helper function to get random appointment slot
    const getRandomSlot = () => {
        const slots = ['morning', 'afternoon', 'evening'];
        return slots[Math.floor(Math.random() * slots.length)];
    };

    // Helper function to get status based on distribution
    const getRandomStatus = () => {
        const rand = Math.random();
        if (rand < 0.6) return 'pending';
        if (rand < 0.9) return 'confirmed';
        return 'cancelled';
    };

    const sampleAppointments = [
        {
            patientName: 'Rajesh Kumar',
            mobileNumber: '9876543210',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'morning',
            status: 'pending',
            dndAuthorized: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Priya Sharma',
            mobileNumber: '8765432109',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'afternoon',
            status: 'confirmed',
            dndAuthorized: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Amit Singh',
            mobileNumber: '7654321098',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'evening',
            status: 'pending',
            dndAuthorized: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Sunita Patel',
            mobileNumber: '9123456789',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'morning',
            status: 'confirmed',
            dndAuthorized: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Vikram Gupta',
            mobileNumber: '8234567890',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'afternoon',
            status: 'cancelled',
            dndAuthorized: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Meera Joshi',
            mobileNumber: '7345678901',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'evening',
            status: 'pending',
            dndAuthorized: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Ravi Agarwal',
            mobileNumber: '9456789012',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'morning',
            status: 'pending',
            dndAuthorized: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Kavita Reddy',
            mobileNumber: '8567890123',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'afternoon',
            status: 'confirmed',
            dndAuthorized: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Suresh Yadav',
            mobileNumber: '7678901234',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'evening',
            status: 'pending',
            dndAuthorized: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Anita Malhotra',
            mobileNumber: '9789012345',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'morning',
            status: 'pending',
            dndAuthorized: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Deepak Verma',
            mobileNumber: '8890123456',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'afternoon',
            status: 'confirmed',
            dndAuthorized: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Pooja Bansal',
            mobileNumber: '7901234567',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'evening',
            status: 'pending',
            dndAuthorized: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Manoj Tiwari',
            mobileNumber: '9012345678',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'morning',
            status: 'cancelled',
            dndAuthorized: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Shalini Kapoor',
            mobileNumber: '8123456789',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'afternoon',
            status: 'pending',
            dndAuthorized: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Arjun Sinha',
            mobileNumber: '7234567890',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'evening',
            status: 'confirmed',
            dndAuthorized: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Nisha Chandra',
            mobileNumber: '9345678901',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'morning',
            status: 'pending',
            dndAuthorized: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Rohit Mishra',
            mobileNumber: '8456789012',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'afternoon',
            status: 'pending',
            dndAuthorized: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Neha Agrawal',
            mobileNumber: '7567890123',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'evening',
            status: 'pending',
            dndAuthorized: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Ashok Pandey',
            mobileNumber: '9678901234',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'morning',
            status: 'confirmed',
            dndAuthorized: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            patientName: 'Rekha Saxena',
            mobileNumber: '6789012345',
            appointmentDate: getRandomAppointmentDate(),
            appointmentSlot: 'afternoon',
            status: 'pending',
            dndAuthorized: true,
            createdAt: now,
            updatedAt: now,
        }
    ];

    await db.insert(appointments).values(sampleAppointments);
    
    console.log('✅ Appointments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});