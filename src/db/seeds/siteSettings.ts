import { db } from '@/db';
import { siteSettings } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    const sampleSettings = [
        {
            settingKey: 'site_name',
            settingValue: 'MediLab Diagnostics',
            description: 'The official name of the medical laboratory displayed across the website',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            settingKey: 'site_email',
            settingValue: 'contact@medilabdiagnostics.com',
            description: 'Primary contact email address for customer inquiries and support',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            settingKey: 'site_phone',
            settingValue: '+91 98765 43210',
            description: 'Main customer service phone number for appointments and general inquiries',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            settingKey: 'address',
            settingValue: '123 Health Plaza, Medical District, Mumbai, Maharashtra 400001',
            description: 'Complete physical address of the main laboratory facility',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            settingKey: 'working_hours',
            settingValue: 'Monday to Saturday: 7:00 AM - 8:00 PM, Sunday: 8:00 AM - 6:00 PM',
            description: 'Operating hours for sample collection and report delivery services',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            settingKey: 'emergency_contact',
            settingValue: '+91 98765 11911',
            description: '24/7 emergency contact number for urgent medical situations and critical reports',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            settingKey: 'report_delivery_time',
            settingValue: 'Reports delivered within 24-48 hours',
            description: 'Standard time frame for delivering test results to patients',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            settingKey: 'home_collection_fee',
            settingValue: '₹100 for home sample collection',
            description: 'Additional charges for home visit sample collection service',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            settingKey: 'cancellation_policy',
            settingValue: 'Appointments can be cancelled up to 2 hours before scheduled time. No charges for cancellation within this timeframe.',
            description: 'Policy regarding appointment cancellations and associated terms',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            settingKey: 'privacy_policy_url',
            settingValue: '/privacy-policy',
            description: 'URL path to the privacy policy page explaining data handling practices',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            settingKey: 'terms_of_service_url',
            settingValue: '/terms-of-service',
            description: 'URL path to terms and conditions governing the use of laboratory services',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            settingKey: 'lab_license_number',
            settingValue: 'LAB/MH/2024/001234',
            description: 'Official medical laboratory license number issued by health authorities',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(siteSettings).values(sampleSettings);
    
    console.log('✅ Site settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});