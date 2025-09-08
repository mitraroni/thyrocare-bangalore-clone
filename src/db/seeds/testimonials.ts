import { db } from '@/db';
import { testimonials } from '@/db/schema';

async function main() {
    const sampleTestimonials = [
        {
            name: 'Dr. Rajesh Kumar',
            designation: 'Cardiologist',
            company: 'Apollo Hospital',
            content: 'As a medical professional, I understand the importance of accurate diagnostics. This laboratory has consistently delivered precise results with remarkable turnaround times. Their cardiac enzyme panels and lipid profiles are processed with utmost care, and the detailed reports help me make informed decisions for my patients. The staff is knowledgeable and maintains excellent communication throughout the process. I particularly appreciate their digital report system which allows me to access results instantly.',
            rating: 5,
            imageUrl: null,
            status: 'active',
            createdAt: new Date('2024-02-15').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        },
        {
            name: 'Priya Sharma',
            designation: 'Software Engineer',
            company: 'TCS',
            content: 'I have been using their services for my annual health checkups for the past two years. What impressed me most is their home collection service - the phlebotomist arrived exactly on time and was very professional. The online booking system is user-friendly, and I love how I can track my sample status and download reports directly from their website. The comprehensive health packages are reasonably priced and cover all essential tests. Highly recommend for working professionals who value convenience.',
            rating: 5,
            imageUrl: null,
            status: 'active',
            createdAt: new Date('2024-03-10').toISOString(),
            updatedAt: new Date('2024-03-10').toISOString(),
        },
        {
            name: 'Meera Nair',
            designation: 'Homemaker',
            company: 'Homemaker',
            content: 'I was nervous about getting my diabetes monitoring tests done, but the staff here made me feel completely comfortable. The lab is spotlessly clean and well-organized. They explained each test clearly and provided helpful advice about fasting requirements. The reports came with reference ranges and easy-to-understand explanations. Their customer service team followed up to ensure I understood my results. The pricing is very affordable, especially their family packages which we now use regularly.',
            rating: 5,
            imageUrl: null,
            status: 'active',
            createdAt: new Date('2024-04-05').toISOString(),
            updatedAt: new Date('2024-04-05').toISOString(),
        },
        {
            name: 'Amit Patel',
            designation: 'Business Owner',
            company: 'Patel Industries',
            content: 'Running a business means I have very limited time for medical appointments. This lab has been a game-changer with their flexible scheduling and quick service. I can book appointments online even late at night, and they accommodate early morning slots before my business hours. The executive health package is comprehensive and perfect for busy entrepreneurs. Their modern equipment ensures accurate results, and the professional staff maintains complete confidentiality. Excellent value for money.',
            rating: 4,
            imageUrl: null,
            status: 'active',
            createdAt: new Date('2024-05-20').toISOString(),
            updatedAt: new Date('2024-05-20').toISOString(),
        },
        {
            name: 'Kavitha Reddy',
            designation: 'School Teacher',
            company: 'Delhi Public School',
            content: 'As a teacher, I need to maintain good health to effectively manage my classroom. This laboratory has been supporting my health journey with regular thyroid monitoring and vitamin deficiency tests. The staff is always courteous and patient, especially when I bring my elderly mother for her tests. They offer senior citizen discounts and take extra care with elderly patients. The lab maintains high hygiene standards, and their reports are detailed and easy to interpret. Thank you for the excellent service.',
            rating: 5,
            imageUrl: null,
            status: 'active',
            createdAt: new Date('2024-06-12').toISOString(),
            updatedAt: new Date('2024-06-12').toISOString(),
        },
        {
            name: 'Suresh Gupta',
            designation: 'Retired Government Officer',
            company: 'Retired',
            content: 'At my age, regular health monitoring is crucial. This lab has been exceptionally supportive in managing my routine blood work and diabetes monitoring. The staff understands the needs of senior citizens and provides comfortable seating and patient care. Their home collection service is particularly beneficial when I cannot travel. The technicians are gentle and skilled, making blood draws painless. The detailed reports help my doctor track my health progress effectively. Truly professional service.',
            rating: 5,
            imageUrl: null,
            status: 'active',
            createdAt: new Date('2024-07-08').toISOString(),
            updatedAt: new Date('2024-07-08').toISOString(),
        },
        {
            name: 'Deepika Singh',
            designation: 'Marketing Manager',
            company: 'Hindustan Unilever',
            content: 'I discovered this lab through a colleague recommendation and have been impressed with their service quality. The pre-marital health package I took was comprehensive and reasonably priced. What sets them apart is their attention to detail and follow-up care. They called to confirm my fasting status before the appointment and provided clear instructions for each test. The modern facility with latest equipment gives confidence in result accuracy. Their customer support team is responsive and helpful with any queries.',
            rating: 4,
            imageUrl: null,
            status: 'active',
            createdAt: new Date('2024-08-15').toISOString(),
            updatedAt: new Date('2024-08-15').toISOString(),
        },
        {
            name: 'Ravi Krishnan',
            designation: 'Bank Manager',
            company: 'State Bank of India',
            content: 'Working in the banking sector requires maintaining good health for long working hours. This laboratory has been my healthcare partner for over a year now. Their corporate wellness packages are excellent and cover all necessary health parameters. The staff is professional and maintains strict confidentiality - important for someone in my position. I appreciate their flexible timing that accommodates my busy schedule. The digital reports are secure and easily accessible through their portal. Highly satisfied with their services.',
            rating: 5,
            imageUrl: null,
            status: 'active',
            createdAt: new Date('2024-09-03').toISOString(),
            updatedAt: new Date('2024-09-03').toISOString(),
        },
        {
            name: 'Anita Joshi',
            designation: 'Yoga Instructor',
            company: 'Wellness Studio',
            content: 'As someone focused on health and wellness, I am particular about the quality of medical services I choose. This lab stands out for its holistic approach to health diagnostics. They offer specialized tests for fitness enthusiasts and nutritional assessments that help me guide my students better. The clean, peaceful environment of the lab aligns with wellness principles. Their preventive health packages are thoughtfully designed and affordable. The staff genuinely cares about patient wellbeing beyond just conducting tests.',
            rating: 5,
            imageUrl: null,
            status: 'active',
            createdAt: new Date('2024-10-18').toISOString(),
            updatedAt: new Date('2024-10-18').toISOString(),
        }
    ];

    await db.insert(testimonials).values(sampleTestimonials);
    
    console.log('✅ Testimonials seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});