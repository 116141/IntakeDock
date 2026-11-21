import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

export const CreateTenantSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only')
    .min(2)
    .max(50),
  contactEmail: z.string().trim().email(),
  defaultCurrency: z.enum(['USD', 'EUR']).default('USD'),
}).strict();

export const RequestItemInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  instructionsForClient: z.string().trim().max(500).default(''),
  expectedDocType: z.string().trim().min(2).max(60).default('unknown'),
  isRequired: z.boolean().default(true),
  requireExpiryCheck: z.boolean().default(false),
}).strict();

export const CreateRequestSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  clientEmail: z.string().trim().email(),
  clientPhoneE164: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, 'Use international E.164 format, e.g. +14155552671')
    .optional()
    .or(z.literal('')),
  title: z.string().trim().min(2).max(140),
  templateId: z.string().uuid().optional(),
  items: z.array(RequestItemInputSchema).min(1).max(25),
}).strict();

export const UploadUrlRequestSchema = z.object({
  portalToken: z.string().min(20).max(128),
  requestItemId: z.string().uuid(),
  filename: z.string().trim().min(1).max(180),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  fileSizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
}).strict();

export const ConfirmUploadSchema = z.object({
  portalToken: z.string().min(20).max(128),
  requestItemId: z.string().uuid(),
  quarantinePath: z.string().min(10).max(300),
  originalFilename: z.string().trim().min(1).max(180),
  allowManualOverride: z.boolean().default(false),
}).strict();

export const ReviewItemSchema = z.object({
  requestItemId: z.string().uuid(),
  decision: z.enum(['human_approved', 'rejected']),
  rejectionReason: z.string().trim().max(300).optional(),
}).strict();

export const DocumentAIValidationSchema = z.object({
  isLegible: z.boolean(),
  legibilityScore: z.number().int().min(0).max(100),
  detectedDocType: z.enum([
    'id_card',
    'passport',
    'drivers_license',
    'proof_of_address',
    'bank_statement',
    'tax_return',
    'incorporation_doc',
    'contract',
    'certificate',
    'unknown',
  ]),
  matchesExpectedType: z.boolean(),
  matchConfidence: z.number().min(0).max(1),
  extractedExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  issues: z.array(
    z.enum([
      'blurry',
      'cropped_edges',
      'glare_reflection',
      'blank_or_low_contrast',
      'wrong_document_type',
      'missing_signature_or_stamp',
      'multi_page_incomplete',
    ])
  ),
  securityFlags: z.array(z.enum(['prompt_injection_attempt', 'suspicious_overlay'])),
  clientFeedbackShort: z.string().max(240),
}).strict();

export type DocumentAIValidation = z.infer<typeof DocumentAIValidationSchema>;
