import { db } from '@/db';
import { packages } from '@/db/schema';

async function main() {
    const samplePackages = [
        {
            name: 'Complete Blood Count (CBC)',
            description: 'Comprehensive blood analysis to check overall health and detect various disorders.',
            price: 800.00,
            discountPrice: 560.00,
            testsIncluded: 'Hemoglobin, RBC Count, WBC Count, Platelet Count, Hematocrit, MCV, MCH, MCHC, Differential Count (Neutrophils, Lymphocytes, Eosinophils, Monocytes, Basophils)',
            isFeatured: true,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            name: 'Lipid Profile Complete',
            description: 'Essential tests to assess cardiovascular health and cholesterol levels.',
            price: 1200.00,
            discountPrice: 840.00,
            testsIncluded: 'Total Cholesterol, HDL Cholesterol, LDL Cholesterol, VLDL Cholesterol, Triglycerides, Total Cholesterol/HDL Ratio, LDL/HDL Ratio',
            isFeatured: true,
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            name: 'Diabetes Panel Advanced',
            description: 'Comprehensive diabetes screening and monitoring package.',
            price: 1500.00,
            discountPrice: 1050.00,
            testsIncluded: 'Fasting Blood Glucose, Post Prandial Glucose, HbA1c (Glycated Hemoglobin), Random Blood Sugar, Insulin Fasting, C-Peptide',
            isFeatured: false,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'Liver Function Test (LFT)',
            description: 'Complete liver health assessment and enzyme evaluation.',
            price: 1000.00,
            discountPrice: null,
            testsIncluded: 'Bilirubin Total, Bilirubin Direct, Bilirubin Indirect, SGOT/AST, SGPT/ALT, Alkaline Phosphatase, Total Protein, Albumin, Globulin, A/G Ratio',
            isFeatured: false,
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            name: 'Kidney Function Test (KFT)',
            description: 'Comprehensive kidney health evaluation and function assessment.',
            price: 900.00,
            discountPrice: 630.00,
            testsIncluded: 'Urea, Creatinine, BUN, BUN/Creatinine Ratio, Estimated GFR, Uric Acid, Sodium, Potassium, Chloride',
            isFeatured: false,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'Thyroid Profile Complete (T3, T4, TSH)',
            description: 'Complete thyroid function assessment for metabolic health.',
            price: 1800.00,
            discountPrice: null,
            testsIncluded: 'T3 (Triiodothyronine), T4 (Thyroxine), TSH (Thyroid Stimulating Hormone), Free T3, Free T4, Anti-TPO Antibodies, Thyroglobulin',
            isFeatured: true,
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            name: 'Vitamin Profile Essential',
            description: 'Key vitamin deficiency screening for optimal health.',
            price: 2500.00,
            discountPrice: 1750.00,
            testsIncluded: 'Vitamin D (25-OH), Vitamin B12, Folate, Vitamin B6, Vitamin B1, Vitamin C, Vitamin A, Vitamin E',
            isFeatured: false,
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            name: 'Cardiac Markers Panel',
            description: 'Heart health assessment and cardiac risk evaluation.',
            price: 3200.00,
            discountPrice: null,
            testsIncluded: 'Troponin I, CK-MB, LDH, Homocysteine, hs-CRP (High Sensitivity C-Reactive Protein), Pro-BNP, Myoglobin',
            isFeatured: false,
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            name: 'Executive Health Checkup',
            description: 'Comprehensive health screening package for busy professionals.',
            price: 4500.00,
            discountPrice: 3150.00,
            testsIncluded: 'CBC, Lipid Profile, LFT, KFT, Thyroid Profile, Diabetes Panel, Urine Analysis, ECG, Chest X-Ray, Vitamin D, B12, Iron Studies, ESR, CRP',
            isFeatured: false,
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            name: 'Women\'s Health Package',
            description: 'Specialized health screening designed for women\'s wellness.',
            price: 3800.00,
            discountPrice: null,
            testsIncluded: 'CBC, Thyroid Profile, Iron Studies, Vitamin D, B12, Folate, Calcium, Pap Smear, Mammography, Bone Density, Hormone Panel (FSH, LH, Estradiol, Progesterone)',
            isFeatured: false,
            createdAt: new Date('2024-02-03').toISOString(),
            updatedAt: new Date('2024-02-03').toISOString(),
        }
    ];

    await db.insert(packages).values(samplePackages);
    
    console.log('✅ Packages seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});