import { db } from '@/db';
import { faqs } from '@/db/schema';

async function main() {
    const sampleFaqs = [
        {
            question: 'Do I need to fast before my blood test?',
            answer: 'Fasting is required for certain tests like lipid profile, glucose, and liver function tests. You need to fast for 8-12 hours before the test. Water is allowed during fasting. For other tests like CBC, thyroid, or vitamin levels, fasting is not required. Please check your test requirements or consult our staff.',
            sortOrder: 0,
            isActive: true,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            question: 'How long does it take to get my test results?',
            answer: 'Most routine tests like CBC, blood sugar, and basic chemistry panels are available within 4-6 hours. Complex tests like cultures, hormonal assays, and genetic tests may take 24-48 hours or up to 7 days. You will receive an SMS notification when your reports are ready.',
            sortOrder: 1,
            isActive: true,
            createdAt: new Date('2024-01-16').toISOString(),
            updatedAt: new Date('2024-01-16').toISOString(),
        },
        {
            question: 'Can I book a home sample collection?',
            answer: 'Yes, we offer home sample collection services for your convenience. Our trained phlebotomists will visit your home at your preferred time. Home collection is available from 6:00 AM to 10:00 PM. Additional charges of ₹100-200 may apply depending on your location.',
            sortOrder: 2,
            isActive: true,
            createdAt: new Date('2024-01-17').toISOString(),
            updatedAt: new Date('2024-01-17').toISOString(),
        },
        {
            question: 'What are your lab timings?',
            answer: 'Our lab is open Monday to Sunday from 6:00 AM to 10:00 PM. Sample collection is available throughout these hours. Report collection and consultations are available from 8:00 AM to 8:00 PM. We also offer 24/7 emergency services for critical tests.',
            sortOrder: 3,
            isActive: true,
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            question: 'Do you accept insurance coverage?',
            answer: 'Yes, we are empaneled with major insurance providers including ICICI Lombard, HDFC ERGO, Star Health, and Bajaj Allianz. Please bring your insurance card and ID proof. Pre-authorization may be required for certain high-value tests. Cash and card payments are also accepted.',
            sortOrder: 4,
            isActive: true,
            createdAt: new Date('2024-01-19').toISOString(),
            updatedAt: new Date('2024-01-19').toISOString(),
        },
        {
            question: 'How accurate are your test results?',
            answer: 'Our lab maintains 99.5% accuracy with international quality standards. We are NABL accredited and follow strict quality control measures. All equipment is calibrated regularly, and we participate in external quality assurance programs. If you have concerns about any result, we offer free retesting within 7 days.',
            sortOrder: 5,
            isActive: true,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            question: 'What is included in a Complete Blood Count (CBC) test?',
            answer: 'CBC test includes red blood cell count, white blood cell count, platelet count, hemoglobin levels, hematocrit, and differential white cell count. It helps detect anemia, infections, blood disorders, and immune system problems. The test takes about 30 minutes and results are available in 2-4 hours.',
            sortOrder: 6,
            isActive: true,
            createdAt: new Date('2024-01-21').toISOString(),
            updatedAt: new Date('2024-01-21').toISOString(),
        },
        {
            question: 'How do I prepare for a cholesterol test?',
            answer: 'Fast for 9-12 hours before the test (only water allowed). Avoid alcohol for 24 hours and maintain your regular medication schedule unless advised otherwise by your doctor. Avoid heavy exercise 24 hours before the test. The lipid profile includes total cholesterol, LDL, HDL, and triglycerides.',
            sortOrder: 7,
            isActive: true,
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            question: 'Can I get my reports online?',
            answer: 'Yes, all reports are available online through our patient portal within 30 minutes of completion. You will receive login credentials via SMS and email. Reports can be downloaded as PDF files and are stored securely for 2 years. Physical reports are also available for collection.',
            sortOrder: 8,
            isActive: true,
            createdAt: new Date('2024-01-23').toISOString(),
            updatedAt: new Date('2024-01-23').toISOString(),
        },
        {
            question: 'What health packages do you offer?',
            answer: 'We offer comprehensive health packages including Basic Health Checkup (₹1,500), Executive Health Package (₹3,500), Diabetes Package (₹800), Heart Health Package (₹2,200), and Women\'s Health Package (₹2,800). Packages include multiple tests at discounted rates with free doctor consultation.',
            sortOrder: 9,
            isActive: true,
            createdAt: new Date('2024-01-24').toISOString(),
            updatedAt: new Date('2024-01-24').toISOString(),
        },
        {
            question: 'How do I book an appointment?',
            answer: 'You can book appointments online through our website, mobile app, or by calling our helpline. Walk-in appointments are also available but may have longer waiting times. Online booking allows you to choose your preferred time slot and receive confirmation instantly.',
            sortOrder: 10,
            isActive: true,
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            question: 'What should I know about blood sugar testing?',
            answer: 'Fasting blood sugar requires 8-12 hours of fasting. Random blood sugar can be done anytime. HbA1c test shows average blood sugar over 3 months and doesn\'t require fasting. For glucose tolerance test, you need to drink a glucose solution and have multiple blood draws over 2-3 hours.',
            sortOrder: 11,
            isActive: true,
            createdAt: new Date('2024-01-26').toISOString(),
            updatedAt: new Date('2024-01-26').toISOString(),
        },
        {
            question: 'Do you provide sample collection for elderly or disabled patients?',
            answer: 'Yes, we provide special assistance for elderly and disabled patients. Our trained staff can help with wheelchair access, comfortable seating, and gentle sample collection techniques. Home collection is highly recommended for patients with mobility issues at no extra charge within city limits.',
            sortOrder: 12,
            isActive: true,
            createdAt: new Date('2024-01-27').toISOString(),
            updatedAt: new Date('2024-01-27').toISOString(),
        },
        {
            question: 'Can I track my test results history?',
            answer: 'Yes, our patient portal maintains your complete test history for easy tracking of health trends. You can compare results over time, download previous reports, and share them with your healthcare providers. The system also sends reminders for periodic health checkups based on your medical history.',
            sortOrder: 13,
            isActive: true,
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            question: 'What safety measures do you follow for sample collection?',
            answer: 'We follow strict infection control protocols including use of sterile, single-use needles and collection tubes. Our staff wears gloves and masks, sanitizes hands between patients, and follows WHO guidelines. All biomedical waste is disposed of safely through authorized agencies. Your safety is our top priority.',
            sortOrder: 14,
            isActive: true,
            createdAt: new Date('2024-01-29').toISOString(),
            updatedAt: new Date('2024-01-29').toISOString(),
        }
    ];

    await db.insert(faqs).values(sampleFaqs);
    
    console.log('✅ FAQs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});