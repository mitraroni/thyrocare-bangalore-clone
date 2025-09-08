import { db } from '@/db';
import { announcements } from '@/db/schema';

async function main() {
    const sampleAnnouncements = [
        {
            title: 'New Advanced Cardiac Biomarker Testing Now Available',
            content: 'We are excited to announce the launch of our comprehensive cardiac biomarker panel, featuring high-sensitivity troponin I, NT-proBNP, and CK-MB testing. This advanced testing capability allows for earlier detection of heart attacks and better assessment of cardiovascular risk. Our new automated analyzers provide results within 30 minutes, enabling faster clinical decision-making for emergency departments and cardiology practices. The tests are performed using state-of-the-art immunoassay technology with enhanced precision and accuracy. All cardiac biomarker tests are available 24/7 to support critical patient care needs.',
            type: 'info',
            startDate: new Date('2024-01-15').toISOString(),
            endDate: null,
            status: 'active',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            title: 'System Maintenance - Limited Services December 24-25',
            content: 'Please be advised that our laboratory information system will undergo scheduled maintenance on December 24th from 6:00 PM to December 25th at 8:00 AM. During this period, routine test processing will continue, but online result reporting and appointment scheduling will be temporarily unavailable. Emergency and stat testing will remain operational throughout the maintenance window. We recommend downloading any needed reports before the maintenance period begins. Our phone lines will remain open for urgent inquiries at 555-LAB-TEST. We apologize for any inconvenience and appreciate your understanding as we upgrade our systems to serve you better.',
            type: 'warning',
            startDate: new Date('2023-12-20').toISOString(),
            endDate: new Date('2023-12-26').toISOString(),
            status: 'active',
            createdAt: new Date('2023-12-18').toISOString(),
            updatedAt: new Date('2023-12-18').toISOString(),
        },
        {
            title: 'CAP Accreditation Renewed - Excellence in Laboratory Medicine',
            content: 'MediCore Diagnostics is proud to announce the successful renewal of our College of American Pathologists (CAP) accreditation for another two years. This prestigious accreditation demonstrates our unwavering commitment to the highest standards of laboratory testing and patient safety. Our laboratory underwent rigorous inspection of over 8,000 quality requirements covering all aspects of laboratory operations, from specimen collection to result reporting. The CAP accreditation ensures that our patients and healthcare providers can trust in the accuracy, reliability, and timeliness of our laboratory results. This achievement reflects the dedication of our entire laboratory team to excellence in diagnostic medicine.',
            type: 'success',
            startDate: new Date('2024-02-01').toISOString(),
            endDate: null,
            status: 'active',
            createdAt: new Date('2024-01-30').toISOString(),
            updatedAt: new Date('2024-01-30').toISOString(),
        },
        {
            title: 'Free Health Screening Campaign - February 2024',
            content: 'Join us for our annual community health screening campaign throughout February 2024. We are offering complimentary basic health screenings including blood glucose, cholesterol panel, blood pressure checks, and BMI assessment. The campaign aims to promote preventive healthcare and early detection of common health conditions in our community. Screenings will be conducted at our main laboratory facility every Saturday from 8:00 AM to 2:00 PM, with no appointment necessary. Our certified medical technologists will provide immediate results and basic health counseling. Additional comprehensive health packages will be available at discounted rates for those interested in more detailed testing. Registration is now open on our website.',
            type: 'info',
            startDate: new Date('2024-01-25').toISOString(),
            endDate: new Date('2024-02-29').toISOString(),
            status: 'active',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            title: 'Award Recognition - Best Diagnostic Laboratory 2024',
            content: 'We are thrilled to share that MediCore Diagnostics has been recognized as the "Best Diagnostic Laboratory 2024" by the Regional Healthcare Excellence Awards. This honor acknowledges our outstanding performance in accuracy, turnaround times, customer service, and technological innovation. The award evaluation considered patient satisfaction scores, quality metrics, accreditation standards, and community impact over the past year. We have maintained a 99.8% accuracy rate across all testing procedures and achieved average turnaround times that exceed industry standards. This recognition belongs to our entire team of dedicated laboratory professionals who work tirelessly to provide exceptional diagnostic services to our patients and healthcare partners.',
            type: 'success',
            startDate: new Date('2024-03-01').toISOString(),
            endDate: null,
            status: 'active',
            createdAt: new Date('2024-02-28').toISOString(),
            updatedAt: new Date('2024-02-28').toISOString(),
        }
    ];

    await db.insert(announcements).values(sampleAnnouncements);
    
    console.log('✅ Announcements seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});