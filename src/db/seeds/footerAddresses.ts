import { db } from '@/db';
import { footerAddresses } from '@/db/schema';

async function main() {
    const sampleAddresses = [
        {
            addressLine1: 'Thyrocare House, A-14, Sector 2',
            addressLine2: 'TTC Industrial Area, Turbhe',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400705',
            country: 'India',
            isActive: true,
            displayOrder: 0,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            addressLine1: 'Plot No. 45, Sector 18',
            addressLine2: 'Institutional Area, Gurgaon',
            city: 'Delhi',
            state: 'Delhi',
            postalCode: '110075',
            country: 'India',
            isActive: true,
            displayOrder: 1,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            addressLine1: '3rd Floor, Prestige Meridian II',
            addressLine2: 'MG Road, Shanthala Nagar',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
            isActive: true,
            displayOrder: 2,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
    ];

    await db.insert(footerAddresses).values(sampleAddresses);
    
    console.log('✅ Footer addresses seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});