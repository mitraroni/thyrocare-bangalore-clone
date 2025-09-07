import { db } from '@/db';
import { promotionalBanners } from '@/db/schema';

async function main() {
    const sampleBanners = [
        {
            text: '🩺 Book Your Health Checkup Today - 20% Off on All Packages!',
            backgroundColor: '#2563eb',
            textColor: '#ffffff',
            isActive: true,
            sortOrder: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            text: '🏠 Free Home Sample Collection Available - Call Now!',
            backgroundColor: '#16a34a',
            textColor: '#ffffff',
            isActive: true,
            sortOrder: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            text: '⚡ Get Your Reports in 24 Hours - Fast & Accurate Testing',
            backgroundColor: '#0891b2',
            textColor: '#ffffff',
            isActive: true,
            sortOrder: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            text: '🎯 Special Diabetes Package - Complete Screening ₹999 Only',
            backgroundColor: '#059669',
            textColor: '#ffffff',
            isActive: false,
            sortOrder: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            text: '💊 Vitamin D Test - Essential for Your Health - Book Now',
            backgroundColor: '#1d4ed8',
            textColor: '#ffffff',
            isActive: true,
            sortOrder: 4,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            text: '🔬 NABL Accredited Lab - Trust Our Accurate Results',
            backgroundColor: '#0d9488',
            textColor: '#ffffff',
            isActive: false,
            sortOrder: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(promotionalBanners).values(sampleBanners);
    
    console.log('✅ Promotional banners seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});