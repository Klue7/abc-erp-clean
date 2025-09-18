// Simple smoke-test for customers API
// Usage: node ./scripts/smoke-customers.js
// Ensure your dev server is running at http://localhost:3000 (or set BASE_URL env var)

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function req(path, opts = {}) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch(e) { body = text; }
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    return { ok: false, status: 0, error: String(err) };
  }
}

async function main(){
  console.log('Smoke test starting against', BASE);

  // 1) List customers
  console.log('\n1) GET /api/customers');
  let r = await req('/api/customers');
  console.log(r);

  if (!r.ok && r.status === 403) {
    console.error('\nReceived 403 Unauthorized from the server. Your dev server requires authentication.');
    console.error('For local smoke tests you can start the web dev server with the NEXT_PUBLIC_BYPASS_AUTH environment variable set to "1".');
    console.error('\nPowerShell example:');
    console.error("$env:NEXT_PUBLIC_BYPASS_AUTH='1'; pnpm --filter ./apps/web exec next dev");
    console.error('\nBash example:');
    console.error("NEXT_PUBLIC_BYPASS_AUTH=1 pnpm --filter ./apps/web exec next dev");
    console.error('\nAlternatively, provide a test auth token and I can modify the script to include Authorization headers.');
    return;
  }

  // 2) Create a new customer
  console.log('\n2) POST /api/customers');
  const newCustomer = { name: 'Smoke Tester', email: `smoke+${Date.now()}@example.com`, company: 'QA Inc', tier: 'basic' };
  r = await req('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCustomer) });
  console.log(r);
  if (!r.ok) { console.log('Create failed, aborting smoke test'); return; }

  const created = r.body;
  const id = created?.id || created?.data?.id || null;

  // 3) GET by id (if id present)
  if (id) {
    console.log(`\n3) GET /api/customers/${id}`);
    r = await req(`/api/customers/${id}`);
    console.log(r);

    // 4) PUT update
    console.log(`\n4) PUT /api/customers/${id}`);
    const update = { name: 'Smoke Tester Updated' };
    r = await req(`/api/customers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(update) });
    console.log(r);

    // 5) DELETE
    console.log(`\n5) DELETE /api/customers/${id}`);
    r = await req(`/api/customers/${id}`, { method: 'DELETE' });
    console.log(r);
  } else {
    console.log('\nNo id returned from create step; skipping GET/PUT/DELETE checks.');
  }

  // Pricing tiers: create + list
  console.log('\n6) POST /api/pricing-tiers');
  const newTier = { code: `smoke-${Date.now()}`, name: 'Smoke Tier', discountPercent: 15, active: true };
  r = await req('/api/pricing-tiers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTier) });
  console.log(r);
  if (!r.ok) { console.log('Create pricing tier failed, skipping pricing checks'); return; }

  console.log('\n7) GET /api/pricing-tiers');
  r = await req('/api/pricing-tiers');
  console.log(r);

  // Catalog page (frontend route)
  console.log('\n8) GET /catalog');
  r = await req('/catalog');
  console.log({ ok: r.ok, status: r.status, bodySnippet: (typeof r.body === 'string' ? r.body.slice(0,200) : JSON.stringify(r.body).slice(0,200)) });

  console.log('\nSmoke test complete');
}

main().catch(err => { console.error('Smoke test error', err); process.exit(1); });
