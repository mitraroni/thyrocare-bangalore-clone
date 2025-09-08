import { db } from '@/db';
import { blogCategories } from '@/db/schema';

async function main() {
    const sampleCategories = [
        {
            name: 'Health Tips',
            slug: 'health-tips',
            description: 'Practical wellness advice and preventive healthcare tips to help you maintain optimal health and wellbeing.',
            createdAt: new Date('2024-07-15').toISOString(),
            updatedAt: new Date('2024-07-15').toISOString(),
        },
        {
            name: 'Lab Services',
            slug: 'lab-services',
            description: 'Comprehensive information about our diagnostic services, laboratory tests, and healthcare screening packages.',
            createdAt: new Date('2024-08-10').toISOString(),
            updatedAt: new Date('2024-08-10').toISOString(),
        },
        {
            name: 'Medical News',
            slug: 'medical-news',
            description: 'Latest developments in medical diagnostics, healthcare innovations, and breakthrough research findings.',
            createdAt: new Date('2024-09-05').toISOString(),
            updatedAt: new Date('2024-09-05').toISOString(),
        },
        {
            name: 'Diagnostics',
            slug: 'diagnostics',
            description: 'Detailed information about diagnostic procedures, test preparation guidelines, and understanding test results.',
            createdAt: new Date('2024-10-12').toISOString(),
            updatedAt: new Date('2024-10-12').toISOString(),
        },
        {
            name: 'Wellness',
            slug: 'wellness',
            description: 'Lifestyle and wellness content focusing on nutrition, exercise, mental health, and holistic healthcare approaches.',
            createdAt: new Date('2024-11-20').toISOString(),
            updatedAt: new Date('2024-11-20').toISOString(),
        },
        {
            name: 'Prevention',
            slug: 'prevention',
            description: 'Preventive care strategies, early detection methods, and health screening recommendations for various conditions.',
            createdAt: new Date('2024-12-08').toISOString(),
            updatedAt: new Date('2024-12-08').toISOString(),
        },
        {
            name: 'Medical Technology',
            slug: 'medical-technology',
            description: 'Updates on cutting-edge medical equipment, diagnostic technology advances, and laboratory automation innovations.',
            createdAt: new Date('2024-12-28').toISOString(),
            updatedAt: new Date('2024-12-28').toISOString(),
        },
        {
            name: 'Patient Care',
            slug: 'patient-care',
            description: 'Resources for patient support, healthcare guidance, appointment preparation, and understanding medical procedures.',
            createdAt: new Date('2025-01-10').toISOString(),
            updatedAt: new Date('2025-01-10').toISOString(),
        }
    ];

    await db.insert(blogCategories).values(sampleCategories);
    
    console.log('✅ Blog categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});