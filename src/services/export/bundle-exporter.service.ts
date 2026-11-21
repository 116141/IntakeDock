import 'server-only';
import crypto from 'node:crypto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { zipSync } from 'fflate';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { sanitizeFilename } from '@/lib/security/tokens';

interface ExportItemRow {
  id: string;
  title: string;
  status: string;
  submission: {
    storage_path: string;
    mime_type: string;
    sha256_checksum: string;
    original_filename_sanitized: string;
    created_at: string;
  } | null;
}

export async function generateRequestBundle(params: {
  tenantId: string;
  tenantName: string;
  requestId: string;
  requestTitle: string;
  clientName: string;
  clientEmail: string;
  format: 'zip' | 'pdf';
  createdByUserId: string;
  items: ExportItemRow[];
}): Promise<{ signedUrl: string }> {
  const supabaseAdmin = createSupabaseAdminClient();

  // 1. Build 00_Audit_Index.pdf
  const indexPdf = await PDFDocument.create();
  const fontBold = await indexPdf.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await indexPdf.embedFont(StandardFonts.Helvetica);
  const page = indexPdf.addPage([595.28, 841.89]);
  let y = 780;

  page.drawText(`${params.tenantName} — IntakeDock Audit Index`, {
    x: 48,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  });
  y -= 24;
  page.drawText(`Request: ${params.requestTitle}`, { x: 48, y, size: 11, font: fontRegular });
  y -= 16;
  page.drawText(`Client: ${params.clientName} (${params.clientEmail})`, { x: 48, y, size: 10, font: fontRegular });
  y -= 16;
  page.drawText(`Generated UTC: ${new Date().toISOString()}`, { x: 48, y, size: 9, font: fontRegular, color: rgb(0.39, 0.45, 0.55) });
  y -= 28;

  params.items.forEach((item, idx) => {
    if (y < 70) return;
    const label = `${String(idx + 1).padStart(2, '0')}. ${item.title} [${item.status}]`;
    page.drawText(label, { x: 48, y, size: 10, font: fontBold });
    y -= 14;
    if (item.submission) {
      page.drawText(`SHA-256: ${item.submission.sha256_checksum.slice(0, 32)}...`, {
        x: 62,
        y,
        size: 8,
        font: fontRegular,
        color: rgb(0.39, 0.45, 0.55),
      });
      y -= 16;
    } else {
      y -= 6;
    }
  });

  const indexBytes = await indexPdf.save();
  const exportId = crypto.randomUUID();

  if (params.format === 'zip') {
    const zipEntries: Record<string, Uint8Array> = {
      '00_Audit_Index.pdf': indexBytes,
    };

    for (let i = 0; i < params.items.length; i += 1) {
      const item = params.items[i];
      if (!item?.submission) continue;
      const { data, error } = await supabaseAdmin.storage
        .from('id-vault')
        .download(item.submission.storage_path);
      if (error || !data) continue;

      const ext = item.submission.mime_type === 'application/pdf' ? 'pdf' : item.submission.mime_type.split('/')[1] ?? 'bin';
      const safeTitle = sanitizeFilename(item.title.toLowerCase().replace(/\s+/g, '_'));
      const entryName = `${String(i + 1).padStart(2, '0')}_${safeTitle}.${ext}`;
      zipEntries[entryName] = new Uint8Array(await data.arrayBuffer());
    }

    const zipped = zipSync(zipEntries, { level: 6 });
    const exportPath = `tenants/${params.tenantId}/exports/${exportId}.zip`;
    const { error: upErr } = await supabaseAdmin.storage
      .from('id-exports')
      .upload(exportPath, zipped, { contentType: 'application/zip' });
    if (upErr) throw new Error(`Export upload failed: ${upErr.message}`);

    await supabaseAdmin.from('id_export_artifacts').insert({
      request_id: params.requestId,
      tenant_id: params.tenantId,
      storage_path: exportPath,
      format: 'zip',
      created_by: params.createdByUserId,
    });

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from('id-exports')
      .createSignedUrl(exportPath, 60, { download: `${sanitizeFilename(params.clientName)}_dossier.zip` });
    if (signErr || !signed) throw new Error('Failed to sign export URL');
    return { signedUrl: signed.signedUrl };
  }

  // Merged PDF mode
  const mergedPdf = await PDFDocument.load(indexBytes);
  for (const item of params.items) {
    if (!item.submission) continue;
    const { data, error } = await supabaseAdmin.storage
      .from('id-vault')
      .download(item.submission.storage_path);
    if (error || !data) continue;
    const bytes = new Uint8Array(await data.arrayBuffer());

    if (item.submission.mime_type === 'application/pdf') {
      try {
        const src = await PDFDocument.load(bytes);
        const copied = await mergedPdf.copyPages(src, src.getPageIndices());
        copied.forEach((p) => mergedPdf.addPage(p));
      } catch {
        // Skip unreadable PDF
      }
    } else if (item.submission.mime_type === 'image/jpeg' || item.submission.mime_type === 'image/png') {
      try {
        const img =
          item.submission.mime_type === 'image/png'
            ? await mergedPdf.embedPng(bytes)
            : await mergedPdf.embedJpg(bytes);
        const imgPage = mergedPdf.addPage([595.28, 841.89]);
        const dims = img.scaleToFit(500, 740);
        imgPage.drawImage(img, {
          x: (595.28 - dims.width) / 2,
          y: (841.89 - dims.height) / 2,
          width: dims.width,
          height: dims.height,
        });
      } catch {
        // Skip unsupported image encoding
      }
    }
  }

  const mergedBytes = await mergedPdf.save();
  const exportPath = `tenants/${params.tenantId}/exports/${exportId}.pdf`;
  const { error: upErr } = await supabaseAdmin.storage
    .from('id-exports')
    .upload(exportPath, mergedBytes, { contentType: 'application/pdf' });
  if (upErr) throw new Error(`Export upload failed: ${upErr.message}`);

  await supabaseAdmin.from('id_export_artifacts').insert({
    request_id: params.requestId,
    tenant_id: params.tenantId,
    storage_path: exportPath,
    format: 'pdf',
    created_by: params.createdByUserId,
  });

  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from('id-exports')
    .createSignedUrl(exportPath, 60, { download: `${sanitizeFilename(params.clientName)}_dossier.pdf` });
  if (signErr || !signed) throw new Error('Failed to sign export URL');
  return { signedUrl: signed.signedUrl };
}
