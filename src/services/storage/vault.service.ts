import 'server-only';
import crypto from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
import { PDFDocument } from 'pdf-lib';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES } from '@/schemas/intake.schema';

const EXTENSION_BY_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function createQuarantineUploadUrl(params: {
  tenantId: string;
  requestId: string;
  requestItemId: string;
  mimeType: string;
}) {
  const supabaseAdmin = createSupabaseAdminClient();
  const ext = EXTENSION_BY_MIME[params.mimeType] ?? 'bin';
  const objectId = crypto.randomUUID();
  const quarantinePath = `tenants/${params.tenantId}/requests/${params.requestId}/items/${params.requestItemId}/${objectId}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from('id-quarantine')
    .createSignedUploadUrl(quarantinePath);

  if (error || !data) {
    throw new Error(`Failed to create upload URL: ${error?.message ?? 'unknown'}`);
  }

  return {
    quarantinePath,
    signedUrl: data.signedUrl,
    token: data.token,
  };
}

export async function inspectAndPromoteFromQuarantine(params: {
  quarantinePath: string;
  tenantId: string;
  requestId: string;
  requestItemId: string;
}): Promise<{
  vaultPath: string;
  detectedMime: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  buffer: Buffer;
}> {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: downloaded, error: dlError } = await supabaseAdmin.storage
    .from('id-quarantine')
    .download(params.quarantinePath);

  if (dlError || !downloaded) {
    throw new Error('Uploaded file not found in quarantine');
  }

  const arrayBuf = await downloaded.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);

  if (buffer.byteLength === 0 || buffer.byteLength > MAX_UPLOAD_BYTES) {
    await supabaseAdmin.storage.from('id-quarantine').remove([params.quarantinePath]);
    throw new Error('File exceeds maximum allowed size (15 MB)');
  }

  const detected = await fileTypeFromBuffer(buffer);
  const detectedMime = detected?.mime ?? '';
  if (!ALLOWED_MIME_TYPES.includes(detectedMime as (typeof ALLOWED_MIME_TYPES)[number])) {
    await supabaseAdmin.storage.from('id-quarantine').remove([params.quarantinePath]);
    throw new Error('Unsupported or disguised file type. Please upload PDF, JPEG, PNG, or WebP.');
  }

  if (detectedMime === 'application/pdf') {
    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: false });
    } catch {
      await supabaseAdmin.storage.from('id-quarantine').remove([params.quarantinePath]);
      throw new Error('PDF is password-protected or corrupted. Please unlock and re-upload.');
    }

    if (pdfDoc.getPageCount() > 25) {
      await supabaseAdmin.storage.from('id-quarantine').remove([params.quarantinePath]);
      throw new Error('PDF exceeds 25-page limit per item.');
    }
  }

  const sha256Checksum = crypto.createHash('sha256').update(buffer).digest('hex');
  const ext = EXTENSION_BY_MIME[detectedMime] ?? 'bin';
  const vaultPath = `tenants/${params.tenantId}/requests/${params.requestId}/items/${params.requestItemId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('id-vault')
    .upload(vaultPath, buffer, {
      contentType: detectedMime,
      upsert: false,
    });

  await supabaseAdmin.storage.from('id-quarantine').remove([params.quarantinePath]);

  if (uploadError) {
    throw new Error(`Failed to store document in vault: ${uploadError.message}`);
  }

  return {
    vaultPath,
    detectedMime,
    fileSizeBytes: buffer.byteLength,
    sha256Checksum,
    buffer,
  };
}

export async function createVaultViewUrl(vaultPath: string, downloadFilename?: string): Promise<string> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.storage
    .from('id-vault')
    .createSignedUrl(vaultPath, 60, downloadFilename ? { download: downloadFilename } : undefined);

  if (error || !data) {
    throw new Error('Failed to create temporary view URL');
  }
  return data.signedUrl;
}
