export interface PresetChecklistItem {
  title: string;
  instructionsForClient: string;
  expectedDocType: string;
  isRequired: boolean;
  requireExpiryCheck: boolean;
}

export interface IndustryPreset {
  id: 'accounting' | 'legal' | 'real_estate' | 'hr';
  label: string;
  description: string;
  items: PresetChecklistItem[];
}

export const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: 'accounting',
    label: 'Accounting & Tax Onboarding',
    description: 'Annual tax filing, bookkeeping setup, and corporate verification.',
    items: [
      {
        title: 'Government Photo ID / Passport',
        instructionsForClient: 'Upload a clear, uncropped color photo or PDF of your valid ID or passport.',
        expectedDocType: 'id_card',
        isRequired: true,
        requireExpiryCheck: true,
      },
      {
        title: 'Last 3 Months Bank Statements',
        instructionsForClient: 'Official PDF statements exported from your business bank account.',
        expectedDocType: 'bank_statement',
        isRequired: true,
        requireExpiryCheck: false,
      },
      {
        title: 'Prior Year Tax Return',
        instructionsForClient: 'Most recent filed corporate or personal tax return PDF.',
        expectedDocType: 'tax_return',
        isRequired: true,
        requireExpiryCheck: false,
      },
      {
        title: 'Company Incorporation / Tax ID Certificate',
        instructionsForClient: 'Official registration or EIN/NIF certificate.',
        expectedDocType: 'incorporation_doc',
        isRequired: false,
        requireExpiryCheck: false,
      },
    ],
  },
  {
    id: 'real_estate',
    label: 'Real Estate & Rental Qualification',
    description: 'Tenant screening, lease onboarding, and property purchase intake.',
    items: [
      {
        title: 'Valid Photo ID or Passport',
        instructionsForClient: 'Ensure all four corners and text are clearly readable without glare.',
        expectedDocType: 'id_card',
        isRequired: true,
        requireExpiryCheck: true,
      },
      {
        title: 'Proof of Address (Last 60 Days)',
        instructionsForClient: 'Utility bill, lease agreement, or bank statement showing your current address.',
        expectedDocType: 'proof_of_address',
        isRequired: true,
        requireExpiryCheck: false,
      },
      {
        title: 'Proof of Income / Bank Statements',
        instructionsForClient: 'Last 3 pay stubs or recent bank statements.',
        expectedDocType: 'bank_statement',
        isRequired: true,
        requireExpiryCheck: false,
      },
    ],
  },
  {
    id: 'legal',
    label: 'Legal & Visa Case Intake',
    description: 'Client retention, immigration filings, and notarized document packs.',
    items: [
      {
        title: 'Passport Biographical Page',
        instructionsForClient: 'High-resolution scan or photo of your passport photo page.',
        expectedDocType: 'passport',
        isRequired: true,
        requireExpiryCheck: true,
      },
      {
        title: 'Signed Engagement Letter',
        instructionsForClient: 'Signed copy of our engagement agreement.',
        expectedDocType: 'contract',
        isRequired: true,
        requireExpiryCheck: false,
      },
      {
        title: 'Supporting Certificate / Record',
        instructionsForClient: 'Birth, marriage, or clearance certificate if applicable.',
        expectedDocType: 'certificate',
        isRequired: false,
        requireExpiryCheck: false,
      },
    ],
  },
  {
    id: 'hr',
    label: 'HR New Hire Onboarding',
    description: 'Fast employee document collection before day one.',
    items: [
      {
        title: 'Government ID or Driver License',
        instructionsForClient: 'Front side clearly visible and unexpired.',
        expectedDocType: 'drivers_license',
        isRequired: true,
        requireExpiryCheck: true,
      },
      {
        title: 'Signed Employment Contract',
        instructionsForClient: 'All pages signed and dated.',
        expectedDocType: 'contract',
        isRequired: true,
        requireExpiryCheck: false,
      },
      {
        title: 'Proof of Residence',
        instructionsForClient: 'Recent utility bill or official residence letter.',
        expectedDocType: 'proof_of_address',
        isRequired: true,
        requireExpiryCheck: false,
      },
    ],
  },
];
