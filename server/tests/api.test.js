import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../src/app.js';
import User from '../src/models/User.js';
import Issue from '../src/models/Issue.js';

let mongoServer;

test.before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_secret_for_civictrack_tests_12345';
  mongoServer = await MongoMemoryServer.create({
    instance: {
      launchTimeout: 60000,
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

test.after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

test('CivicTrack API Suite', async (t) => {
  let citizenToken = '';
  let adminToken = '';
  let createdIssueId = '';
  let createdIssueMongoId = '';

  await t.test('1. GET /api/health should return online status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'online');
    assert.equal(res.body.service, 'CivicTrack API');
  });

  await t.test('2. POST /api/auth/register should register citizen and ignore role tampering', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Citizen',
      email: 'john@example.com',
      password: 'Password123!',
      role: 'admin', // Tamper attempt: public registration must force 'citizen'
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.role, 'citizen', 'Role should be citizen despite admin tampering in body');
    assert.ok(res.body.token);
    citizenToken = res.body.token;
  });

  await t.test('3. Duplicate email registration should fail', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Clone',
      email: 'john@example.com',
      password: 'Password123!',
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await t.test('4. POST /api/auth/login with valid credentials should succeed', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'Password123!',
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
  });

  await t.test('5. Setup Admin account and login', async () => {
    const hash = await User.hashPassword('AdminPass123!');
    const admin = await User.create({
      name: 'Admin Lead',
      email: 'admin@civic.gov',
      passwordHash: hash,
      role: 'admin',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@civic.gov',
      password: 'AdminPass123!',
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'admin');
    adminToken = res.body.token;
  });

  await t.test('6. POST /api/issues should create an issue when authenticated', async () => {
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        title: 'Broken Traffic Light at Central Plaza',
        description: 'The traffic signal at 5th and Main is stuck on flashing yellow, causing massive gridlock and near misses.',
        category: 'Streetlights',
        locationAddress: '5th Ave & Main Street',
        locationLandmark: 'Central Plaza',
        urgency: 'High',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.issue.issueId.startsWith('CT-'));
    assert.equal(res.body.issue.status, 'Pending');
    createdIssueId = res.body.issue.issueId;
    createdIssueMongoId = res.body.issue._id;
  });

  await t.test('7. GET /api/issues should return list with search and filters', async () => {
    const res = await request(app)
      .get('/api/issues?category=Streetlights')
      .set('Authorization', `Bearer ${citizenToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.issues.length >= 1);
    assert.equal(res.body.issues[0].category, 'Streetlights');
  });

  await t.test('8. POST /api/issues/:id/upvote toggles upvote cleanly', async () => {
    // 1st Upvote
    const vote1 = await request(app)
      .post(`/api/issues/${createdIssueMongoId}/upvote`)
      .set('Authorization', `Bearer ${citizenToken}`);

    assert.equal(vote1.status, 200);
    assert.equal(vote1.body.hasUpvoted, true);
    assert.equal(vote1.body.upvoteCount, 1);

    // 2nd call removes upvote (toggle)
    const vote2 = await request(app)
      .post(`/api/issues/${createdIssueMongoId}/upvote`)
      .set('Authorization', `Bearer ${citizenToken}`);

    assert.equal(vote2.status, 200);
    assert.equal(vote2.body.hasUpvoted, false);
    assert.equal(vote2.body.upvoteCount, 0);

    // Re-upvote for priority testing
    await request(app)
      .post(`/api/issues/${createdIssueMongoId}/upvote`)
      .set('Authorization', `Bearer ${citizenToken}`);
  });

  await t.test('9. Citizen attempting admin status change should be rejected (403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/issues/${createdIssueMongoId}/status`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        status: 'Resolved',
        note: 'Citizen trying to self-resolve',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('10. Admin can transition issue status to In Progress and Resolved with audit trail', async () => {
    const res = await request(app)
      .patch(`/api/issues/${createdIssueMongoId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'In Progress',
        note: 'Dispatching field traffic technician.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.issue.status, 'In Progress');
    assert.ok(res.body.issue.statusHistory.length >= 2);

    // Now resolve
    const resResolve = await request(app)
      .patch(`/api/issues/${createdIssueMongoId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Resolved',
        note: 'Control circuit board replaced.',
        resolutionNote: 'Traffic signals synchronized and operating normally.',
      });

    assert.equal(resResolve.status, 200);
    assert.equal(resResolve.body.issue.status, 'Resolved');
    assert.equal(resResolve.body.issue.resolutionNote, 'Traffic signals synchronized and operating normally.');
  });

  await t.test('11. Reopening/returning a resolved issue without an explanatory note should fail', async () => {
    const res = await request(app)
      .patch(`/api/issues/${createdIssueMongoId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'In Progress',
        note: '', // Missing note for rollback
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await t.test('12. Reopening/returning a resolved issue with an audit note should succeed', async () => {
    const res = await request(app)
      .patch(`/api/issues/${createdIssueMongoId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'In Progress',
        note: 'Reopened issue: Citizens reported intermittent power fluctuation.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.issue.status, 'In Progress');
    const latestHistory = res.body.issue.statusHistory[res.body.issue.statusHistory.length - 1];
    assert.equal(latestHistory.note, 'Reopened issue: Citizens reported intermittent power fluctuation.');
  });

  await t.test('13. GET /api/dashboard/stats returns real aggregated statistics', async () => {
    const res = await request(app).get('/api/dashboard/stats');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.stats.total >= 1);
    assert.ok(res.body.stats.inProgress >= 1, 'Reopened issue should reflect in inProgress count');
    assert.ok(Array.isArray(res.body.categoryBreakdown));
  });
});
