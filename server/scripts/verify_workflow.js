import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000/api';

async function run() {
  console.log('--- STARTING COMPLETE WORKFLOW VERIFICATION ---');

  // 1. Health check
  console.log('\n[1] Checking Health API...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert.equal(healthRes.status, 200);
  assert.equal(healthData.status, 'online');
  console.log('✓ Health check passed:', healthData);

  // 2. Register citizen
  const testEmail = `citizen_${Date.now()}@test.org`;
  console.log(`\n[2] Registering new citizen: ${testEmail}...`);
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alex Rivera',
      email: testEmail,
      password: 'Password@123',
    }),
  });
  const regData = await regRes.json();
  assert.equal(regRes.status, 201);
  assert.ok(regData.token, 'Token should be returned');
  assert.equal(regData.user.role, 'citizen', 'Role should strictly be citizen');
  const citizenToken = regData.token;
  console.log('✓ Citizen registration successful:', regData.user.name, regData.user.email);

  // 3. Login citizen
  console.log('\n[3] Logging in citizen...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'Password@123',
    }),
  });
  const loginData = await loginRes.json();
  assert.equal(loginRes.status, 200);
  assert.ok(loginData.token);
  console.log('✓ Citizen login successful');

  // 4. Report an Issue
  console.log('\n[4] Reporting new civic issue as citizen...');
  const issueRes = await fetch(`${BASE_URL}/issues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${citizenToken}`,
    },
    body: JSON.stringify({
      title: 'Water Pipe Burst at Oak & 5th Avenue',
      category: 'Water Supply',
      urgency: 'High',
      locationAddress: '550 Oak Street, Near 5th Ave',
      locationLandmark: 'Metro Station West Exit',
      locationCity: 'Metro District',
      description: 'Major underground pipeline fracture spewing clean water onto pedestrian sidewalk.',
    }),
  });
  const issueData = await issueRes.json();
  assert.equal(issueRes.status, 201);
  assert.ok(issueData.issue.issueId.startsWith('CT-'));
  assert.equal(issueData.issue.status, 'Pending');
  const createdId = issueData.issue._id;
  const createdTrackingId = issueData.issue.issueId;
  console.log(`✓ Issue created with ID: ${createdTrackingId} (${createdId})`);

  // 5. Query and filter issues
  console.log('\n[5] Querying Explore Issues feed with Category filter...');
  const feedRes = await fetch(`${BASE_URL}/issues?category=Water Supply&sort=newest`);
  const feedData = await feedRes.json();
  assert.equal(feedRes.status, 200);
  assert.ok(feedData.issues.length >= 1);
  console.log(`✓ Feed returned ${feedData.issues.length} Water Supply issues`);

  // 6. Upvote system & duplicate prevention
  console.log('\n[6] Testing upvote toggle & uniqueness...');
  const upvote1 = await fetch(`${BASE_URL}/issues/${createdId}/upvote`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  const up1Data = await upvote1.json();
  assert.equal(up1Data.hasUpvoted, true);
  assert.equal(up1Data.upvoteCount, 1);
  console.log('✓ First upvote incremented count to 1');

  // Upvote again (should toggle/remove upvote)
  const upvote2 = await fetch(`${BASE_URL}/issues/${createdId}/upvote`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  const up2Data = await upvote2.json();
  assert.equal(up2Data.hasUpvoted, false);
  assert.equal(up2Data.upvoteCount, 0);
  console.log('✓ Second upvote toggled count back to 0');

  // Re-upvote
  const upvote3 = await fetch(`${BASE_URL}/issues/${createdId}/upvote`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  const up3Data = await upvote3.json();
  assert.equal(up3Data.hasUpvoted, true);
  assert.equal(up3Data.upvoteCount, 1);
  console.log('✓ Re-upvoted to 1');

  // 7. Admin authentication
  console.log('\n[7] Logging in as Municipal Administrator (admin@civictrack.org)...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@civictrack.org',
      password: 'Admin@12345',
    }),
  });
  const adminData = await adminLoginRes.json();
  assert.equal(adminLoginRes.status, 200);
  assert.equal(adminData.user.role, 'admin');
  const adminToken = adminData.token;
  console.log('✓ Admin login successful:', adminData.user.name);

  // 8. Admin status update: Pending -> In Progress
  console.log('\n[8] Admin transitioning status to "In Progress"...');
  const statusRes1 = await fetch(`${BASE_URL}/issues/${createdId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'In Progress',
      note: 'Water Board emergency valve team deployed to isolate pipeline.',
    }),
  });
  const sData1 = await statusRes1.json();
  assert.equal(statusRes1.status, 200);
  assert.equal(sData1.issue.status, 'In Progress');
  console.log('✓ Status successfully changed to "In Progress"');

  // 9. Admin status update: In Progress -> Resolved
  console.log('\n[9] Admin transitioning status to "Resolved"...');
  const statusRes2 = await fetch(`${BASE_URL}/issues/${createdId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'Resolved',
      note: 'Replacement high-pressure ductile iron valve installed and leak sealed.',
      resolutionNote: 'Main pipeline junction restored to full pressure. Road surface backfilled.',
    }),
  });
  const sData2 = await statusRes2.json();
  assert.equal(statusRes2.status, 200);
  assert.equal(sData2.issue.status, 'Resolved');
  assert.ok(sData2.issue.resolutionNote);
  console.log('✓ Status successfully changed to "Resolved" with resolution note');

  // 10. Verify Citizen Details & Timeline
  console.log('\n[10] Verifying issue details and resolution timeline...');
  const detailRes = await fetch(`${BASE_URL}/issues/${createdId}`);
  const detailData = await detailRes.json();
  assert.equal(detailRes.status, 200);
  assert.equal(detailData.issue.status, 'Resolved');
  assert.ok(detailData.issue.statusHistory.length >= 3, 'Timeline should have 3 history events');
  console.log(`✓ Timeline verified with ${detailData.issue.statusHistory.length} audit entries:`);
  detailData.issue.statusHistory.forEach((h, i) => {
    console.log(`   ${i + 1}. [${h.status}] - ${h.note} (by ${h.changedByName})`);
  });

  // 11. Rollback validation
  console.log('\n[11] Testing rollback validation (Resolved -> In Progress without note)...');
  const badRollback = await fetch(`${BASE_URL}/issues/${createdId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'In Progress',
      note: '',
    }),
  });
  assert.equal(badRollback.status, 400, 'Rollback without note must fail');
  console.log('✓ Rollback without explanatory note was rejected as required (HTTP 400)');

  // 12. Dashboard Stats
  console.log('\n[12] Verifying Dashboard stats aggregation...');
  const dashRes = await fetch(`${BASE_URL}/dashboard/stats`);
  const dashData = await dashRes.json();
  assert.equal(dashRes.status, 200);
  assert.ok(dashData.stats.total >= 1);
  assert.ok(dashData.stats.resolved >= 1);
  console.log('✓ Dashboard stats verified from database:', dashData.stats);

  console.log('\n======================================================');
  console.log('ALL WORKFLOWS TESTED & VERIFIED ON LIVE BACKEND: 100% PASS');
  console.log('======================================================\n');
}

run().catch((err) => {
  console.error('\n❌ Workflow verification failed:', err);
  process.exit(1);
});
