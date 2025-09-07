import { db } from '@/db';
import { footerContacts } from '@/db/schema';

async function main() {
    const sampleFooterContacts = [
        {
            contactType: 'phone',
            contactValue: '9876543210',
            label: 'Customer Service',
            isActive: true,
            displayOrder: 0,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            contactType: 'email',
            contactValue: 'support@medlabdiagnostics.in',
            label: 'Technical Support',
            isActive: true,
            displayOrder: 1,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            contactType: 'phone',
            contactValue: '8765432109',
            label: 'Emergency Helpline',
            isActive: true,
            displayOrder: 2,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            contactType: 'email',
            contactValue: 'info@medlabdiagnostics.in',
            label: 'General Inquiries',
            isActive: true,
            displayOrder: 3,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            contactType: 'fax',
            contactValue: '7654321098',
            label: 'Reports & Documents',
            isActive: true,
            displayOrder: 4,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        }
    ];

    await db.insert(footerContacts).values(sampleFooterContacts);
    
    console.log('✅ Footer contacts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});