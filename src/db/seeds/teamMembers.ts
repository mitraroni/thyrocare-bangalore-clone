import { db } from '@/db';
import { teamMembers } from '@/db/schema';

async function main() {
    const sampleTeamMembers = [
        {
            name: 'Dr. Rajesh Kumar',
            designation: 'Lab Director & Chief Medical Officer',
            bio: 'Dr. Rajesh Kumar brings over 20 years of clinical laboratory experience to MedLab Diagnostics. He completed his MD in Pathology from AIIMS Delhi and holds an MBA in Healthcare Management from IIM Bangalore. Previously serving as Senior Consultant at Apollo Hospitals, Dr. Kumar has published over 40 research papers in international journals. He specializes in molecular diagnostics, immunopathology, and laboratory automation. Under his leadership, our lab has achieved NABL accreditation and CAP certification. He is actively involved in training programs for medical technologists and has been instrumental in implementing quality management systems across our diagnostic network.',
            imageUrl: null,
            email: 'rajesh.kumar@medlabdiagnostics.com',
            phone: '+91 9876543210',
            socialLinks: JSON.stringify({ linkedin: 'https://linkedin.com/in/rajesh-kumar-md' }),
            orderPosition: 0,
            status: 'active',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'Dr. Priya Sharma',
            designation: 'Senior Pathologist & Clinical Lead',
            bio: 'Dr. Priya Sharma is a board-certified pathologist with 15 years of experience in clinical and anatomical pathology. She earned her MD in Pathology from Maulana Azad Medical College and completed advanced training in cytopathology from Tata Memorial Hospital. Dr. Sharma specializes in cancer diagnostics, fine needle aspiration cytology, and histopathology. She has been recognized for her expertise in rare disease diagnosis and has contributed to several case studies published in leading medical journals. Her meticulous approach to specimen analysis and commitment to diagnostic accuracy has made her an invaluable asset to our laboratory team.',
            imageUrl: null,
            email: 'priya.sharma@medlabdiagnostics.com',
            phone: '+91 9765432109',
            socialLinks: JSON.stringify({ linkedin: 'https://linkedin.com/in/priya-sharma-pathologist' }),
            orderPosition: 1,
            status: 'active',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            name: 'Amit Patel',
            designation: 'Phlebotomy Supervisor & Training Coordinator',
            bio: 'Amit Patel has dedicated 12 years to perfecting the art and science of phlebotomy. He holds a BSc in Medical Laboratory Technology from Gujarat University and is certified by the Indian Association of Medical Laboratory Technologists. Amit leads our phlebotomy team of 25+ technicians across multiple locations. He has personally trained over 200 phlebotomists and developed standardized protocols that have reduced patient discomfort by 40%. His expertise extends to pediatric and geriatric phlebotomy techniques, difficult draw procedures, and home collection services. Amit is passionate about patient care and has implemented several initiatives to improve the overall patient experience during sample collection.',
            imageUrl: null,
            email: 'amit.patel@medlabdiagnostics.com',
            phone: '+91 9654321098',
            socialLinks: null,
            orderPosition: 2,
            status: 'active',
            createdAt: new Date('2024-02-15').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        },
        {
            name: 'Dr. Meera Nair',
            designation: 'Quality Control Manager & Compliance Officer',
            bio: 'Dr. Meera Nair ensures the highest standards of quality and regulatory compliance across all laboratory operations. She holds a PhD in Biochemistry from IISc Bangalore and is certified in ISO 15189 quality management systems. With 14 years of experience in laboratory quality assurance, Dr. Nair has successfully led our lab through multiple accreditation processes including NABL, CAP, and ISO certifications. She oversees internal quality control programs, external quality assessment schemes, and regulatory compliance audits. Her systematic approach to quality management has resulted in a 99.7% accuracy rate in our diagnostic reporting. Dr. Nair also conducts regular training sessions on good laboratory practices and quality assurance protocols.',
            imageUrl: null,
            email: 'meera.nair@medlabdiagnostics.com',
            phone: null,
            socialLinks: JSON.stringify({ linkedin: 'https://linkedin.com/in/meera-nair-quality' }),
            orderPosition: 3,
            status: 'active',
            createdAt: new Date('2024-03-01').toISOString(),
            updatedAt: new Date('2024-03-01').toISOString(),
        },
        {
            name: 'Kavitha Reddy',
            designation: 'Customer Service Manager & Patient Relations',
            bio: 'Kavitha Reddy brings 10 years of healthcare customer service expertise to our organization. She holds an MBA in Hospital Administration from Osmania University and is certified in healthcare customer relationship management. Kavitha leads a team of 15 customer service representatives and has implemented a comprehensive patient feedback system that has improved our customer satisfaction scores to 96%. She specializes in handling complex patient queries, insurance claim support, and report delivery services. Her initiatives include 24/7 helpline support, multilingual assistance, and digital report delivery systems. Kavitha is passionate about ensuring every patient receives personalized attention and timely resolution of their concerns.',
            imageUrl: null,
            email: 'kavitha.reddy@medlabdiagnostics.com',
            phone: '+91 9543210987',
            socialLinks: null,
            orderPosition: 4,
            status: 'active',
            createdAt: new Date('2024-03-15').toISOString(),
            updatedAt: new Date('2024-03-15').toISOString(),
        },
        {
            name: 'Suresh Agarwal',
            designation: 'IT Manager & Digital Systems Architect',
            bio: 'Suresh Agarwal is responsible for all technology infrastructure and digital systems at MedLab Diagnostics. He holds a BTech in Computer Science from IIT Delhi and an MTech in Information Systems from BITS Pilani. With 16 years of experience in healthcare IT, Suresh has implemented cutting-edge laboratory information management systems (LIMS), automated reporting platforms, and secure data management solutions. He has successfully integrated our laboratory systems with hospital networks and developed mobile applications for test booking and report access. His expertise in cybersecurity and data privacy ensures HIPAA compliance and patient data protection. Suresh is currently leading our AI-driven diagnostic assistance project.',
            imageUrl: null,
            email: 'suresh.agarwal@medlabdiagnostics.com',
            phone: '+91 9432109876',
            socialLinks: JSON.stringify({ linkedin: 'https://linkedin.com/in/suresh-agarwal-healthcare-it' }),
            orderPosition: 5,
            status: 'active',
            createdAt: new Date('2024-04-01').toISOString(),
            updatedAt: new Date('2024-04-01').toISOString(),
        },
        {
            name: 'Ravi Krishnan',
            designation: 'Operations Manager & Logistics Coordinator',
            bio: 'Ravi Krishnan oversees the day-to-day operations of our multi-location diagnostic network. He holds an MBA in Operations Management from ISB Hyderabad and has 13 years of experience in healthcare operations. Ravi manages sample logistics, inventory control, equipment maintenance, and facility operations across 12 collection centers. He has optimized our supply chain management, reducing reagent costs by 25% while maintaining quality standards. His expertise includes workflow optimization, staff scheduling, and emergency response protocols. Ravi has implemented lean management principles that have improved turnaround times by 30%. He also coordinates with external agencies for specialized testing and manages our home collection services network.',
            imageUrl: null,
            email: 'ravi.krishnan@medlabdiagnostics.com',
            phone: '+91 9321098765',
            socialLinks: null,
            orderPosition: 6,
            status: 'active',
            createdAt: new Date('2024-04-15').toISOString(),
            updatedAt: new Date('2024-04-15').toISOString(),
        },
        {
            name: 'Dr. Sunita Verma',
            designation: 'Senior Microbiologist & Infection Control Specialist',
            bio: 'Dr. Sunita Verma is our lead microbiologist with specialized expertise in clinical microbiology and antimicrobial resistance. She completed her PhD in Microbiology from Jawaharlal Nehru University and has 18 years of laboratory experience. Dr. Verma oversees our bacteriology, virology, mycology, and parasitology departments. She has established rapid diagnostic protocols for infectious diseases and implemented automated microbial identification systems. Her research on antibiotic resistance patterns has been published in prestigious journals. Dr. Verma also serves as our infection control officer, ensuring biosafety protocols and managing laboratory-acquired infection prevention programs. She regularly collaborates with hospitals on outbreak investigations and antimicrobial stewardship programs.',
            imageUrl: null,
            email: 'sunita.verma@medlabdiagnostics.com',
            phone: null,
            socialLinks: JSON.stringify({ linkedin: 'https://linkedin.com/in/sunita-verma-microbiologist' }),
            orderPosition: 7,
            status: 'active',
            createdAt: new Date('2024-05-01').toISOString(),
            updatedAt: new Date('2024-05-01').toISOString(),
        }
    ];

    await db.insert(teamMembers).values(sampleTeamMembers);
    
    console.log('✅ Team members seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});