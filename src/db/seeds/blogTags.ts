import { db } from '@/db';
import { blogTags } from '@/db/schema';

async function main() {
    const sampleTags = [
        {
            name: 'Blood Test',
            slug: 'blood-test',
            createdAt: new Date('2024-10-15').toISOString(),
            updatedAt: new Date('2024-10-15').toISOString(),
        },
        {
            name: 'Diabetes',
            slug: 'diabetes',
            createdAt: new Date('2024-10-18').toISOString(),
            updatedAt: new Date('2024-10-18').toISOString(),
        },
        {
            name: 'Cardiology',
            slug: 'cardiology',
            createdAt: new Date('2024-10-22').toISOString(),
            updatedAt: new Date('2024-10-22').toISOString(),
        },
        {
            name: 'Thyroid Function',
            slug: 'thyroid-function',
            createdAt: new Date('2024-10-25').toISOString(),
            updatedAt: new Date('2024-10-25').toISOString(),
        },
        {
            name: 'Kidney Function',
            slug: 'kidney-function',
            createdAt: new Date('2024-10-28').toISOString(),
            updatedAt: new Date('2024-10-28').toISOString(),
        },
        {
            name: 'Liver Function',
            slug: 'liver-function',
            createdAt: new Date('2024-11-02').toISOString(),
            updatedAt: new Date('2024-11-02').toISOString(),
        },
        {
            name: 'Cholesterol',
            slug: 'cholesterol',
            createdAt: new Date('2024-11-05').toISOString(),
            updatedAt: new Date('2024-11-05').toISOString(),
        },
        {
            name: 'Vitamin Deficiency',
            slug: 'vitamin-deficiency',
            createdAt: new Date('2024-11-08').toISOString(),
            updatedAt: new Date('2024-11-08').toISOString(),
        },
        {
            name: 'Cancer Screening',
            slug: 'cancer-screening',
            createdAt: new Date('2024-11-12').toISOString(),
            updatedAt: new Date('2024-11-12').toISOString(),
        },
        {
            name: 'Women\'s Health',
            slug: 'womens-health',
            createdAt: new Date('2024-11-15').toISOString(),
            updatedAt: new Date('2024-11-15').toISOString(),
        },
        {
            name: 'Men\'s Health',
            slug: 'mens-health',
            createdAt: new Date('2024-11-18').toISOString(),
            updatedAt: new Date('2024-11-18').toISOString(),
        },
        {
            name: 'Pediatric Care',
            slug: 'pediatric-care',
            createdAt: new Date('2024-11-22').toISOString(),
            updatedAt: new Date('2024-11-22').toISOString(),
        },
        {
            name: 'Preventive Care',
            slug: 'preventive-care',
            createdAt: new Date('2024-11-25').toISOString(),
            updatedAt: new Date('2024-11-25').toISOString(),
        },
        {
            name: 'Early Detection',
            slug: 'early-detection',
            createdAt: new Date('2024-11-28').toISOString(),
            updatedAt: new Date('2024-11-28').toISOString(),
        },
        {
            name: 'Health Screening',
            slug: 'health-screening',
            createdAt: new Date('2024-12-02').toISOString(),
            updatedAt: new Date('2024-12-02').toISOString(),
        },
        {
            name: 'Annual Checkup',
            slug: 'annual-checkup',
            createdAt: new Date('2024-12-05').toISOString(),
            updatedAt: new Date('2024-12-05').toISOString(),
        },
        {
            name: 'Lab Results',
            slug: 'lab-results',
            createdAt: new Date('2024-12-08').toISOString(),
            updatedAt: new Date('2024-12-08').toISOString(),
        },
        {
            name: 'Test Preparation',
            slug: 'test-preparation',
            createdAt: new Date('2024-12-12').toISOString(),
            updatedAt: new Date('2024-12-12').toISOString(),
        },
        {
            name: 'Fasting Requirements',
            slug: 'fasting-requirements',
            createdAt: new Date('2024-12-15').toISOString(),
            updatedAt: new Date('2024-12-15').toISOString(),
        },
        {
            name: 'Home Collection',
            slug: 'home-collection',
            createdAt: new Date('2024-12-18').toISOString(),
            updatedAt: new Date('2024-12-18').toISOString(),
        }
    ];

    await db.insert(blogTags).values(sampleTags);
    
    console.log('✅ Blog tags seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});