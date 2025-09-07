import { db } from '@/db';
import { heroBanners } from '@/db/schema';

async function main() {
    const sampleHeroBanners = [
        {
            title: 'Advanced Medical Testing',
            subtitle: 'Comprehensive lab services with cutting-edge technology and accurate results',
            discountText: '20% Off on All Health Packages',
            ctaText: 'Book Test Now',
            ctaUrl: '/packages',
            backgroundImageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=600&fit=crop',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            title: 'Complete Health Checkup',
            subtitle: 'Full body health screening with 50+ essential tests',
            discountText: 'Starting from ₹999 only',
            ctaText: 'Book Now',
            ctaUrl: '/appointments',
            backgroundImageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=600&fit=crop',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            title: 'Sample Collection at Your Doorstep',
            subtitle: 'Convenient home collection service with trained phlebotomists',
            discountText: 'Free home collection on orders above ₹500',
            ctaText: 'Call Now',
            ctaUrl: 'tel:+919876543210',
            backgroundImageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&h=600&fit=crop',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            title: 'Winter Health Packages',
            subtitle: 'Seasonal health screening to boost your immunity this winter',
            discountText: 'Special winter discounts up to 30%',
            ctaText: 'Get Report',
            ctaUrl: '/winter-packages',
            backgroundImageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&h=600&fit=crop',
            isActive: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    await db.insert(heroBanners).values(sampleHeroBanners);
    
    console.log('✅ Hero banners seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});