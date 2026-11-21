-- IntakeDock (GilByte Solutions) — Multi-Tenant Schema + Strict RLS + Private Storage

CREATE TABLE IF NOT EXISTS public.id_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  contact_email text NOT NULL,
  default_currency text NOT NULL DEFAULT 'USD' CHECK (default_currency IN ('USD', 'EUR')),
  plan_tier text NOT NULL DEFAULT 'starter' CHECK (plan_tier IN ('starter', 'studio')),
  subscription_status text NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'vip', 'past_due', 'canceled', 'suspended')),
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  payment_provider text CHECK (payment_provider IN ('paddle', 'dodo')),
  external_customer_id text,
  external_subscription_id text,
  auto_purge_days integer NOT NULL DEFAULT 90,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.id_tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.id_tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'staff')),
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE OR REPLACE FUNCTION public.id_is_tenant_member(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.id_tenants WHERE id = p_tenant_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.id_tenant_memberships
    WHERE tenant_id = p_tenant_id AND user_id = auth.uid() AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.id_is_tenant_owner(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.id_tenants WHERE id = p_tenant_id AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.id_protect_tenant_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    NEW.subscription_status := OLD.subscription_status;
    NEW.trial_ends_at := OLD.trial_ends_at;
    NEW.payment_provider := OLD.payment_provider;
    NEW.external_customer_id := OLD.external_customer_id;
    NEW.external_subscription_id := OLD.external_subscription_id;
    NEW.plan_tier := OLD.plan_tier;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_id_protect_tenant_billing ON public.id_tenants;
CREATE TRIGGER trg_id_protect_tenant_billing
  BEFORE UPDATE ON public.id_tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.id_protect_tenant_billing_columns();

CREATE TABLE IF NOT EXISTS public.id_checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.id_tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry_preset text NOT NULL DEFAULT 'general' CHECK (industry_preset IN ('accounting', 'legal', 'real_estate', 'hr', 'general')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.id_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.id_checklist_templates(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.id_tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  instructions_for_client text NOT NULL DEFAULT '',
  expected_doc_type text NOT NULL DEFAULT 'unknown',
  is_required boolean NOT NULL DEFAULT true,
  require_expiry_check boolean NOT NULL DEFAULT false,
  accepted_mime_types text[] NOT NULL DEFAULT ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.id_client_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.id_tenants(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.id_checklist_templates(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone_e164 text,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'in_progress', 'needs_review', 'completed', 'archived')),
  portal_token_hash text UNIQUE NOT NULL,
  token_expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  token_revoked_at timestamptz,
  reminder_cadence_days integer NOT NULL DEFAULT 3,
  max_reminders integer NOT NULL DEFAULT 4,
  reminders_sent_count integer NOT NULL DEFAULT 0,
  last_reminder_at timestamptz,
  next_reminder_at timestamptz DEFAULT (now() + interval '3 days'),
  reminders_paused boolean NOT NULL DEFAULT false,
  client_opted_out boolean NOT NULL DEFAULT false,
  last_client_activity_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_id_client_requests_tenant_status ON public.id_client_requests (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_id_client_requests_reminders ON public.id_client_requests (next_reminder_at)
  WHERE status IN ('sent', 'in_progress') AND reminders_paused = false AND client_opted_out = false;

CREATE TABLE IF NOT EXISTS public.id_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.id_client_requests(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.id_tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  instructions_for_client text NOT NULL DEFAULT '',
  expected_doc_type text NOT NULL DEFAULT 'unknown',
  is_required boolean NOT NULL DEFAULT true,
  require_expiry_check boolean NOT NULL DEFAULT false,
  accepted_mime_types text[] NOT NULL DEFAULT ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validating', 'ai_approved', 'ai_flagged', 'human_approved', 'rejected')),
  rejection_reason text,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.id_document_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_item_id uuid NOT NULL REFERENCES public.id_request_items(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.id_client_requests(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.id_tenants(id) ON DELETE CASCADE,
  storage_bucket text NOT NULL DEFAULT 'id-vault',
  storage_path text NOT NULL,
  original_filename_sanitized text NOT NULL,
  mime_type text NOT NULL,
  file_size_bytes bigint NOT NULL,
  sha256_checksum text NOT NULL,
  uploaded_by_type text NOT NULL CHECK (uploaded_by_type IN ('client_portal', 'staff')),
  uploaded_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_current boolean NOT NULL DEFAULT true,
  ai_status text NOT NULL DEFAULT 'pending' CHECK (ai_status IN ('pending', 'processing', 'passed', 'flagged', 'error')),
  ai_confidence numeric(4, 3),
  ai_detected_doc_type text,
  ai_is_legible boolean,
  ai_extracted_expiry_date date,
  ai_is_expired boolean,
  ai_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_client_feedback text,
  ai_model_used text,
  ai_processed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.id_reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.id_client_requests(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.id_tenants(id) ON DELETE CASCADE,
  execution_key text UNIQUE NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'whatsapp_link')),
  status text NOT NULL,
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.id_document_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.id_tenants(id) ON DELETE CASCADE,
  actor_type text NOT NULL CHECK (actor_type IN ('owner', 'staff', 'magic_link_guest', 'super_admin', 'ai_service')),
  actor_id text,
  action text NOT NULL CHECK (action IN ('UPLOAD', 'SIGNED_URL_VIEW', 'PDF_EXPORT', 'ZIP_EXPORT', 'AI_CHECK', 'HUMAN_APPROVE', 'HUMAN_REJECT', 'PURGE', 'TOKEN_REGENERATE')),
  resource_id uuid,
  file_sha256 text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.id_export_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.id_client_requests(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.id_tenants(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  format text NOT NULL CHECK (format IN ('zip', 'pdf')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.id_payment_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('paddle', 'dodo')),
  event_type text NOT NULL,
  tenant_id uuid REFERENCES public.id_tenants(id) ON DELETE SET NULL,
  currency text CHECK (currency IN ('USD', 'EUR')),
  amount text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.id_admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  action text NOT NULL,
  target_tenant_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.id_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_document_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_document_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_export_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS id_tenants_select ON public.id_tenants;
CREATE POLICY id_tenants_select ON public.id_tenants FOR SELECT USING (public.id_is_tenant_member(id));
DROP POLICY IF EXISTS id_tenants_insert ON public.id_tenants;
CREATE POLICY id_tenants_insert ON public.id_tenants FOR INSERT WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS id_tenants_update ON public.id_tenants;
CREATE POLICY id_tenants_update ON public.id_tenants FOR UPDATE USING (public.id_is_tenant_owner(id));

DROP POLICY IF EXISTS id_memberships_select ON public.id_tenant_memberships;
CREATE POLICY id_memberships_select ON public.id_tenant_memberships FOR SELECT
  USING (public.id_is_tenant_member(tenant_id) OR (lower(email) = lower(auth.jwt()->>'email') AND status = 'invited'));
DROP POLICY IF EXISTS id_memberships_manage ON public.id_tenant_memberships;
CREATE POLICY id_memberships_manage ON public.id_tenant_memberships FOR ALL
  USING (public.id_is_tenant_owner(tenant_id)) WITH CHECK (public.id_is_tenant_owner(tenant_id));

DROP POLICY IF EXISTS id_templates_all ON public.id_checklist_templates;
CREATE POLICY id_templates_all ON public.id_checklist_templates FOR ALL
  USING (public.id_is_tenant_member(tenant_id)) WITH CHECK (public.id_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS id_template_items_all ON public.id_template_items;
CREATE POLICY id_template_items_all ON public.id_template_items FOR ALL
  USING (public.id_is_tenant_member(tenant_id)) WITH CHECK (public.id_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS id_requests_all ON public.id_client_requests;
CREATE POLICY id_requests_all ON public.id_client_requests FOR ALL
  USING (public.id_is_tenant_member(tenant_id)) WITH CHECK (public.id_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS id_request_items_all ON public.id_request_items;
CREATE POLICY id_request_items_all ON public.id_request_items FOR ALL
  USING (public.id_is_tenant_member(tenant_id)) WITH CHECK (public.id_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS id_submissions_all ON public.id_document_submissions;
CREATE POLICY id_submissions_all ON public.id_document_submissions FOR ALL
  USING (public.id_is_tenant_member(tenant_id)) WITH CHECK (public.id_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS id_reminder_logs_select ON public.id_reminder_logs;
CREATE POLICY id_reminder_logs_select ON public.id_reminder_logs FOR SELECT USING (public.id_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS id_audit_logs_select ON public.id_document_audit_logs;
CREATE POLICY id_audit_logs_select ON public.id_document_audit_logs FOR SELECT USING (public.id_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS id_exports_select ON public.id_export_artifacts;
CREATE POLICY id_exports_select ON public.id_export_artifacts FOR SELECT USING (public.id_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS id_webhooks_owner_select ON public.id_payment_webhook_events;
CREATE POLICY id_webhooks_owner_select ON public.id_payment_webhook_events FOR SELECT USING (public.id_is_tenant_owner(tenant_id));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('id-quarantine', 'id-quarantine', false, 15728640, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('id-vault', 'id-vault', false, 15728640, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('id-exports', 'id-exports', false, 52428800, ARRAY['application/zip', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;
