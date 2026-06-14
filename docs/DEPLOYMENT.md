# VakalatNama — Deployment Guide

This guide covers everything needed to deploy VakalatNama from development to production.

---

## 1. Environment Variables

Create a `.env` file in the project root (never commit this to version control):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

For Edge Functions, set these secrets via the Supabase CLI:

```bash
supabase secrets set GEMINI_API_KEY=your-gemini-api-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> [!IMPORTANT]
> Never expose `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` in the frontend. These are Edge Function server-side secrets only.

---

## 2. Supabase Setup Checklist

### Tables Required
Ensure all tables exist with the correct schema:

| Table | Key Columns |
|-------|-------------|
| `advocates` | `id` (uuid, FK auth.users), `name`, `email`, `bar_council_no`, `city`, `plan` (default: `'free'`), `expires_at` |
| `clients` | `id`, `advocate_id` (FK advocates), `name`, `phone`, `email`, `city`, `address` |
| `cases` | `id`, `advocate_id`, `client_id`, `case_type`, `court_level`, `plaintiff_name`, `defendant_name`, `incident_date`, `incident_place`, `state`, `evidence_available` (jsonb), `facts_text`, `relief_sought`, `applicable_acts` (jsonb), `status`, `is_draft_saved`, `current_step`, `consent_given` |
| `drafts` | `id`, `case_id`, `advocate_id`, `draft_text`, `identified_laws` (jsonb), `version`, `created_at` |
| `consents` | `id`, `case_id`, `advocate_id`, `draft_id`, `consented_at`, `user_agent`, `ip_address` |
| `token_usage` | `id`, `advocate_id`, `date` (text YYYY-MM-DD), `draft_calls_used`, `assist_calls_used` |
| `audit_logs` | `id`, `advocate_id`, `case_id`, `action`, `metadata` (jsonb), `created_at` |

### Row Level Security (RLS)
Enable RLS on **all** tables. Example policies:

```sql
-- advocates: each user can only see/edit their own row
CREATE POLICY "Own row only" ON advocates
  FOR ALL USING (auth.uid() = id);

-- cases: advocate can only access their own cases
CREATE POLICY "Own cases only" ON cases
  FOR ALL USING (auth.uid() = advocate_id);

-- clients: advocate can only access their own clients
CREATE POLICY "Own clients only" ON clients
  FOR ALL USING (auth.uid() = advocate_id);

-- drafts: advocate can access drafts for their own cases
CREATE POLICY "Own drafts only" ON drafts
  FOR ALL USING (auth.uid() = advocate_id);

-- consents: advocate can access their own consents
CREATE POLICY "Own consents only" ON consents
  FOR ALL USING (auth.uid() = advocate_id);

-- token_usage: advocate accesses only their own usage row
CREATE POLICY "Own usage only" ON token_usage
  FOR ALL USING (auth.uid() = advocate_id);

-- audit_logs: advocate can insert and view own logs
CREATE POLICY "Own audit logs" ON audit_logs
  FOR ALL USING (auth.uid() = advocate_id);
```

### Auth Configuration
In Supabase Dashboard → Authentication → Settings:
- Enable **Email/Password** sign-in
- Set **Site URL** to your production domain (e.g. `https://vakalatnama.vercel.app`)
- Add redirect URLs: `https://vakalatnama.vercel.app/**`

### trigger: Auto-create advocate row on signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.advocates (id, email, name, plan)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''), 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 3. Edge Functions Deployment

### Prerequisites
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-id
```

### Deploy both Edge Functions
```bash
# Deploy generate-draft function
supabase functions deploy generate-draft --no-verify-jwt

# Deploy ai-assist function
supabase functions deploy ai-assist --no-verify-jwt
```

### Set secrets
```bash
supabase secrets set GEMINI_API_KEY=your-gemini-api-key-here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Verify deployment
```bash
supabase functions list
```

Both `generate-draft` and `ai-assist` should show as **Active**.

---

## 4. Vercel Deployment

### One-click deploy
1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import the GitHub repository
4. Set **Framework Preset** to `Vite`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
6. Click **Deploy**

### CLI deploy (alternative)
```bash
npm install -g vercel
npm run build
vercel --prod
```

### Custom domain
In Vercel Dashboard → Project → Domains → Add your domain.
Then update Supabase Site URL and Redirect URLs to match.

---

## 5. Post-Deploy Testing Checklist

Work through this checklist after every deployment:

### Authentication
- [ ] Sign up with a new email creates an account and auto-creates advocate row
- [ ] Login with valid credentials succeeds and redirects to `/dashboard`
- [ ] Attempting to access `/dashboard` when logged out redirects to `/login`

### Dashboard
- [ ] Stats cards show real counts (Total Cases, Clients, Drafts Generated, This Month)
- [ ] Today's Usage bar shows correct draft count
- [ ] Recent cases table shows latest 5 cases
- [ ] Empty state shows when no cases exist

### New Case Flow
- [ ] Step 1 saves client + case info to Supabase
- [ ] Step 2 saves incident details
- [ ] Step 3 saves facts, relief, applicable acts
- [ ] Inline "Add New Client" creates client and selects it
- [ ] Navigation between steps persists data

### Case Review
- [ ] Case Review page loads all case data from Supabase
- [ ] Free plan: shows draft count (X/5) with limit enforcement
- [ ] Premium plan: no draft limit shown
- [ ] "Generate Draft" button calls Edge Function and navigates to Case Detail

### Case Detail
- [ ] Draft text displays correctly
- [ ] Identified Laws section renders
- [ ] Edit Draft mode saves changes to Supabase
- [ ] Regenerate Draft calls Edge Function again
- [ ] Export button is locked until consent is given

### Consent Page
- [ ] Full draft is displayed in scrollable box
- [ ] All 4 checkboxes must be checked before consent button activates
- [ ] Consent is saved to `consents` table with timestamp
- [ ] Case status updates to `Drafted`
- [ ] Word document downloads after consent

### Clients
- [ ] Client cards show real data with case counts
- [ ] Search filters clients correctly (debounced 300ms)
- [ ] Add Client modal validates required fields
- [ ] New client appears immediately after saving

### Settings
- [ ] Profile saves name, bar council no, city
- [ ] Plan badge shows correctly (Free/Premium)
- [ ] API Usage bars reflect today's actual usage
- [ ] Logout clears session and redirects to login

### AI Assist (Premium only)
- [ ] Assist buttons are invisible for Free plan users
- [ ] Assist buttons visible and functional for Premium users
- [ ] Each field type (case_type, facts, relief, acts) returns relevant suggestions
- [ ] Daily limit of 10 assists enforced
- [ ] Near-limit warning shown when ≤3 assists remain

### Route Security
- [ ] Cannot access `/dashboard` when logged out
- [ ] Cannot access `/case-detail/:id` for a case belonging to a different advocate
- [ ] Free users are redirected to `/upgrade` when attempting AI Assist

### Edge Functions
- [ ] `generate-draft` returns valid JSON with `draft_text` and `identified_laws`
- [ ] `ai-assist` returns valid JSON with field-specific suggestions
- [ ] Token usage is incremented correctly after each call
- [ ] Rate limits enforce correctly (5 drafts/day free, 10 assists/day premium)

---

## 6. Troubleshooting

| Issue | Solution |
|-------|----------|
| Edge Function 500 error | Check `supabase functions logs generate-draft` |
| CORS error on API call | Ensure `corsHeaders` include your domain |
| Auth not persisting | Check Supabase Site URL matches deployed URL |
| RLS blocking queries | Verify policies are enabled and correctly written |
| Token usage not updating | Confirm `token_usage` table has correct column names (`date` not `usage_date`) |
| Draft not showing | Check `drafts` table RLS and advocate_id foreign key |
