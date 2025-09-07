import { db } from '@/db';
import { labInfo } from '@/db/schema';

async function main() {
    const sampleLabInfo = [
        {
            name: 'City Center Diagnostics',
            address: 'Shop No. 12-15, Ground Floor, City Center Mall, MG Road, Bangalore, Karnataka 560001',
            phone: '9876543210',
            email: 'citycenter@diagnosticslab.com',
            timings: 'Mon-Sat: 7:00 AM - 8:00 PM, Sun: 8:00 AM - 6:00 PM',
            mapUrl: 'https://maps.google.com/maps?q=12.9716,77.5946',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Phoenix Mall Medical Center',
            address: '2nd Floor, Phoenix MarketCity, Whitefield Road, Mahadevapura, Bangalore, Karnataka 560048',
            phone: '9123456789',
            email: 'phoenixmall@diagnosticslab.com',
            timings: 'Mon-Sun: 9:00 AM - 9:00 PM',
            mapUrl: 'https://maps.google.com/maps?q=12.9975,77.6950',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Highway Diagnostics Hub',
            address: 'Plot No. 45, Near Toll Plaza, NH-44 Highway, Outer Ring Road, Hyderabad, Telangana 500072',
            phone: '8765432109',
            email: 'highway@diagnosticslab.com',
            timings: 'Mon-Sat: 6:30 AM - 9:00 PM, Sun: 7:00 AM - 7:00 PM',
            mapUrl: 'https://maps.google.com/maps?q=17.4065,78.4772',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Metro Station Health Point',
            address: 'Exit Gate 3, Rajiv Gandhi IT Park Metro Station, Chandigarh IT Park, Chandigarh 160101',
            phone: '7890123456',
            email: 'metrostation@diagnosticslab.com',
            timings: 'Mon-Fri: 7:00 AM - 8:30 PM, Sat-Sun: 8:00 AM - 6:30 PM',
            mapUrl: 'https://maps.google.com/maps?q=30.7046,76.7179',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(labInfo).values(sampleLabInfo);
    
    console.log('✅ Lab info seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});