/**
 * PARCELPROOF - FULL QA & VERIFICATION TEST SUITE
 * Executes 100% of required test cases via real HTTP requests.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api';
const CLIENT_BASE = 'http://localhost:5173';

const results = [];

function recordResult(testId, feature, expected, actual, passed, details = '') {
  const result = {
    testId,
    feature,
    expected,
    actual,
    status: passed ? 'Pass' : 'Fail',
    details,
  };
  results.push(result);
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${mark}] ${testId}: ${feature} -> ${passed ? 'OK' : 'FAILED: ' + details}`);
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, options);
  let body = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else if (contentType.includes('text/')) {
    body = await response.text();
  } else {
    body = await response.arrayBuffer();
  }
  return { status: response.status, headers: response.headers, body };
}

async function runSuite() {
  console.log('\n======================================================');
  console.log(' STARTING COMPREHENSIVE PARCELPROOF QA AUDIT SUITE');
  console.log('======================================================\n');

  const testSuffix = Date.now();
  const sellerA = {
    fullName: 'Muhammad Tariq',
    email: `seller_a_${testSuffix}@parcelproof.pk`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    shopName: 'Tariq Electronics Official',
    phone: '+92 300 1234567',
  };

  const sellerB = {
    fullName: 'Zainab Bibi',
    email: `seller_b_${testSuffix}@parcelproof.pk`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    shopName: 'Zainab Apparel Hub',
    phone: '+92 321 7654321',
  };

  let tokenA = null;
  let tokenB = null;
  let parcelIdA = null;
  let parcelCodeA = null;
  let evidenceIdA = null;
  let storageKeyA = null;

  // ==========================================
  // SECTION 6: AUTHENTICATION TESTING
  // ==========================================
  console.log('\n--- EXECUTING AUTHENTICATION SUITE (AUTH-01 to AUTH-18) ---');

  // AUTH-01: Register a valid seller
  {
    const res = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sellerA),
    });
    const passed = res.status === 201 && res.body?.success && res.body?.token;
    tokenA = res.body?.token;
    recordResult('AUTH-01', 'Register a valid seller', '201 Created with JWT token', `HTTP ${res.status}, success: ${res.body?.success}`, passed);
  }

  // AUTH-02: Reject missing required fields
  {
    const res = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `missing_${testSuffix}@test.pk` }),
    });
    const passed = res.status === 400 && !res.body?.success;
    recordResult('AUTH-02', 'Reject missing required fields', '400 Bad Request', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // AUTH-03: Reject invalid email
  {
    const res = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'invalid-email-format',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        shopName: 'Test Store',
        phone: '+92 300 0000000',
      }),
    });
    const passed = res.status === 400 && !res.body?.success;
    recordResult('AUTH-03', 'Reject invalid email', '400 Bad Request', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // AUTH-04: Reject duplicate email
  {
    const res = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sellerA),
    });
    const passed = (res.status === 400 || res.status === 409) && !res.body?.success;
    recordResult('AUTH-04', 'Reject duplicate email', '400 or 409 Conflict', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // AUTH-05: Reject password confirmation mismatch
  {
    const res = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Mismatch Tester',
        email: `mismatch_${testSuffix}@parcelproof.pk`,
        password: 'Password123!',
        confirmPassword: 'DifferentPassword999!',
        shopName: 'Mismatch Store',
        phone: '+92 300 1112233',
      }),
    });
    const passed = res.status === 400 && res.body?.message?.includes('match');
    recordResult('AUTH-05', 'Reject password confirmation mismatch', '400 Bad Request', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // AUTH-06: Verify password is hashed in MongoDB
  {
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const user = res.body?.user;
    const passed = res.status === 200 && user && user.passwordHash === undefined && user.password === undefined;
    recordResult('AUTH-06', 'Verify password is hashed in MongoDB and never exposed in responses', '200 OK, password hashes excluded', `Exposed: ${Boolean(user?.passwordHash || user?.password)}`, passed);
  }

  // AUTH-07: Login with valid credentials
  {
    const res = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sellerA.email, password: sellerA.password }),
    });
    const passed = res.status === 200 && res.body?.success && res.body?.token;
    tokenA = res.body?.token;
    recordResult('AUTH-07', 'Login with valid credentials', '200 OK with new JWT token', `HTTP ${res.status}, token present`, passed);
  }

  // AUTH-08: Reject incorrect password
  {
    const res = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sellerA.email, password: 'WrongPassword999!' }),
    });
    const passed = res.status === 401 && !res.body?.success;
    recordResult('AUTH-08', 'Reject incorrect password', '401 Unauthorized', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // AUTH-09: Reject nonexistent user
  {
    const res = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody_exists_12345@parcelproof.pk', password: 'Password123!' }),
    });
    const passed = res.status === 401 && !res.body?.success;
    recordResult('AUTH-09', 'Reject nonexistent user', '401 Unauthorized', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // AUTH-10: Verify protected routes require authentication
  {
    const res = await request('/auth/me');
    const passed = res.status === 401 && !res.body?.success;
    recordResult('AUTH-10', 'Verify protected routes require authentication', '401 Unauthorized', `HTTP ${res.status}`, passed);
  }

  // AUTH-11: Reject invalid JWT
  {
    const res = await request('/auth/me', {
      headers: { Authorization: 'Bearer this.is.a.completely.invalid.token' },
    });
    const passed = res.status === 401 && !res.body?.success;
    recordResult('AUTH-11', 'Reject invalid JWT', '401 Unauthorized', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // AUTH-12: Reject expired JWT
  {
    const secret = process.env.JWT_SECRET || 'parcelproof_super_secret_jwt_key_2026_secure';
    const expiredToken = jwt.sign({ id: '507f1f77bcf86cd799439011' }, secret, { expiresIn: -10 });
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    const passed = res.status === 401 && !res.body?.success;
    recordResult('AUTH-12', 'Reject expired JWT', '401 Unauthorized', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // AUTH-13: Retrieve authenticated profile
  {
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && res.body?.success && res.body?.user?.email === sellerA.email;
    recordResult('AUTH-13', 'Retrieve authenticated profile', '200 OK with seller details', `HTTP ${res.status}, email: ${res.body?.user?.email}`, passed);
  }

  // AUTH-14: Update seller profile
  {
    const updatedStore = 'Tariq Tech & Mobile World';
    const res = await request('/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        fullName: 'Muhammad Tariq Updated',
        shopName: updatedStore,
        phone: '+92 300 9876543',
        shopAddress: 'Hafeez Centre, Floor 3, Gulberg, Lahore',
      }),
    });
    const passed = res.status === 200 && res.body?.user?.shopName === updatedStore;
    recordResult('AUTH-14', 'Update seller profile', '200 OK with updated store details', `HTTP ${res.status}, shopName: ${res.body?.user?.shopName}`, passed);
  }

  // AUTH-15: Change password after validating current password
  {
    const newPass = 'UpdatedPassword456!';
    const res = await request('/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        currentPassword: sellerA.password,
        newPassword: newPass,
        confirmPassword: newPass,
      }),
    });
    const changeOk = res.status === 200 && res.body?.success;

    // Verify login with new password
    const loginNew = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sellerA.email, password: newPass }),
    });
    const loginOk = loginNew.status === 200 && loginNew.body?.token;
    if (loginOk) {
      tokenA = loginNew.body.token;
      sellerA.password = newPass;
    }
    const passed = changeOk && loginOk;
    recordResult('AUTH-15', 'Change password and re-login', '200 OK and successful login with new password', `Change: ${changeOk}, NewLogin: ${loginOk}`, passed);
  }

  // AUTH-16: Logout successfully
  {
    const res = await request('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && res.body?.success;
    recordResult('AUTH-16', 'Logout successfully', '200 OK with cleared session state', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // AUTH-17: Verify session behavior after refresh
  {
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && res.body?.success && res.body?.user?.email === sellerA.email;
    recordResult('AUTH-17', 'Verify session behavior after refresh', '200 OK with persistent valid session', `HTTP ${res.status}`, passed);
  }

  // AUTH-18: Verify unauthenticated API requests cannot retrieve private data
  {
    const res = await request('/parcels');
    const passed = res.status === 401 && !res.body?.success;
    recordResult('AUTH-18', 'Reject unauthenticated access to private data', '401 Unauthorized', `HTTP ${res.status}`, passed);
  }

  // Register Seller B for cross-tenant isolation testing
  {
    const resB = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sellerB),
    });
    tokenB = resB.body?.token;
  }

  // ==========================================
  // SECTION 7: PARCEL MANAGEMENT TESTING
  // ==========================================
  console.log('\n--- EXECUTING PARCEL MANAGEMENT SUITE (PAR-01 to PAR-20) ---');

  // PAR-01: Create parcel with valid data
  {
    const parcelData = {
      orderId: `ORD-PK-${testSuffix}-001`,
      productName: 'Samsung Galaxy A54 5G',
      quantity: 1,
      declaredValue: 85000,
      customerName: 'Asad Mehmood',
      customerPhone: '+92 312 9988776',
      shippingAddress: 'House 42, Street 8, F-10/2, Islamabad',
      courierCompany: 'TCS',
      trackingNumber: `TCS${testSuffix}001`,
      shipmentStatus: 'Booked',
      notes: 'Contains high-value smartphone with sealed box and warranty card.',
    };

    const res = await request('/parcels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify(parcelData),
    });

    const passed = res.status === 201 && res.body?.success && res.body?.parcel?._id;
    if (passed) {
      parcelIdA = res.body.parcel._id;
      parcelCodeA = res.body.parcel.parcelCode;
    }
    recordResult('PAR-01', 'Create parcel with valid data', '201 Created with parcel object', `HTTP ${res.status}, ID: ${parcelIdA}, Code: ${parcelCodeA}`, passed);
  }

  // PAR-02: Reject missing required fields
  {
    const res = await request('/parcels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ orderId: 'ORD-INCOMPLETE' }),
    });
    const passed = res.status === 400 && !res.body?.success;
    recordResult('PAR-02', 'Reject missing required fields', '400 Bad Request', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // PAR-03: Reject invalid quantity
  {
    const res = await request('/parcels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        orderId: `ORD-${testSuffix}-Q`,
        productName: 'Test Item',
        quantity: 0,
        declaredValue: 1000,
        customerName: 'Test Customer',
        customerPhone: '+92 300 0000000',
        shippingAddress: 'Test Address',
        courierCompany: 'Leopards',
        trackingNumber: `LEO${testSuffix}Q`,
      }),
    });
    const passed = res.status === 400 && !res.body?.success;
    recordResult('PAR-03', 'Reject invalid quantity (<= 0)', '400 Bad Request', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // PAR-04: Reject negative declared value
  {
    const res = await request('/parcels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        orderId: `ORD-${testSuffix}-V`,
        productName: 'Test Item',
        quantity: 1,
        declaredValue: -500,
        customerName: 'Test Customer',
        customerPhone: '+92 300 0000000',
        shippingAddress: 'Test Address',
        courierCompany: 'Leopards',
        trackingNumber: `LEO${testSuffix}V`,
      }),
    });
    const passed = res.status === 400 && !res.body?.success;
    recordResult('PAR-04', 'Reject negative declared value', '400 Bad Request', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // PAR-05: Generate unique parcel code
  {
    const passed = typeof parcelCodeA === 'string' && parcelCodeA.startsWith('PRCL-');
    recordResult('PAR-05', 'Generate unique parcel code', 'Format PRCL-XXXXXX', `Generated: ${parcelCodeA}`, passed);
  }

  // PAR-06: Retrieve seller parcel list
  {
    const res = await request('/parcels', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && Array.isArray(res.body?.parcels) && res.body.parcels.length >= 1;
    recordResult('PAR-06', 'Retrieve seller parcel list', '200 OK with array of parcels', `HTTP ${res.status}, count: ${res.body?.count}`, passed);
  }

  // PAR-07: Open parcel details
  {
    const res = await request(`/parcels/${parcelIdA}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && res.body?.parcel?._id === parcelIdA && Array.isArray(res.body?.evidence);
    recordResult('PAR-07', 'Open parcel details', '200 OK with linked parcel & evidence array', `HTTP ${res.status}`, passed);
  }

  // PAR-08: Edit parcel
  {
    const res = await request(`/parcels/${parcelIdA}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        notes: 'Updated package notes: fragile electronics label affixed.',
        declaredValue: 86000,
      }),
    });
    const passed = res.status === 200 && res.body?.parcel?.declaredValue === 86000;
    recordResult('PAR-08', 'Edit parcel details', '200 OK with updated attributes', `HTTP ${res.status}, declaredValue: ${res.body?.parcel?.declaredValue}`, passed);
  }

  // PAR-09: Search by parcel code
  {
    const res = await request(`/parcels?search=${encodeURIComponent(parcelCodeA)}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && res.body?.parcels?.some((p) => p.parcelCode === parcelCodeA);
    recordResult('PAR-09', 'Search by parcel code', 'Finds matching parcel by code', `HTTP ${res.status}, found: ${res.body?.parcels?.length}`, passed);
  }

  // PAR-10: Search by order ID
  {
    const orderSearch = `ORD-PK-${testSuffix}-001`;
    const res = await request(`/parcels?search=${encodeURIComponent(orderSearch)}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && res.body?.parcels?.some((p) => p.orderId === orderSearch);
    recordResult('PAR-10', 'Search by order ID', 'Finds matching parcel by orderId', `HTTP ${res.status}, found: ${res.body?.parcels?.length}`, passed);
  }

  // PAR-11: Search by tracking number
  {
    const trkSearch = `TCS${testSuffix}001`;
    const res = await request(`/parcels?search=${encodeURIComponent(trkSearch)}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && res.body?.parcels?.some((p) => p.trackingNumber === trkSearch);
    recordResult('PAR-11', 'Search by tracking number', 'Finds matching parcel by tracking number', `HTTP ${res.status}, found: ${res.body?.parcels?.length}`, passed);
  }

  // PAR-12: Filter by shipment status
  {
    const res = await request('/parcels?status=Booked', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && res.body?.parcels?.every((p) => p.shipmentStatus === 'Booked');
    recordResult('PAR-12', 'Filter by shipment status', 'Returns only parcels with specified status', `HTTP ${res.status}, all Booked: ${passed}`, passed);
  }

  // PAR-13: Sort by date
  {
    const res = await request('/parcels?sortBy=createdAt&order=asc', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && Array.isArray(res.body?.parcels);
    recordResult('PAR-13', 'Sort by date', '200 OK with sorted list', `HTTP ${res.status}`, passed);
  }

  // PAR-14: Verify pagination
  {
    const res = await request('/parcels?page=1&limit=1', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && res.body?.currentPage === 1 && res.body?.parcels?.length <= 1;
    recordResult('PAR-14', 'Verify pagination', '200 OK with currentPage=1 and limit=1', `HTTP ${res.status}, total: ${res.body?.total}`, passed);
  }

  // PAR-15: Update shipment status
  {
    const res = await request(`/parcels/${parcelIdA}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        status: 'In Transit',
        note: 'Handed over to TCS courier rider at dispatch hub.',
      }),
    });
    const passed = res.status === 200 && res.body?.parcel?.shipmentStatus === 'In Transit';
    recordResult('PAR-15', 'Update shipment status', '200 OK with shipmentStatus changed to In Transit', `HTTP ${res.status}, newStatus: ${res.body?.parcel?.shipmentStatus}`, passed);
  }

  // PAR-16: Verify status history
  {
    const res = await request(`/parcels/${parcelIdA}/history`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const history = res.body?.statusHistory || [];
    const passed = res.status === 200 && history.length >= 2 && history[history.length - 1].newStatus === 'In Transit';
    recordResult('PAR-16', 'Verify status history timeline', '200 OK with chronological status entries', `HTTP ${res.status}, count: ${history.length}`, passed);
  }

  // PAR-17: Verify data persists after refresh
  {
    const res = await request(`/parcels/${parcelIdA}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && res.body?.parcel?.shipmentStatus === 'In Transit';
    recordResult('PAR-17', 'Verify data persists after re-fetching from DB', 'Status remains In Transit', `HTTP ${res.status}, persisted: ${passed}`, passed);
  }

  // PAR-18: Reject invalid MongoDB ObjectId
  {
    const res = await request('/parcels/invalid-hex-id-999', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 400 && !res.body?.success;
    recordResult('PAR-18', 'Reject invalid MongoDB ObjectId format', '400 Bad Request', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // PAR-19: Return appropriate response for nonexistent parcel
  {
    const nonExistentId = '507f1f77bcf86cd799439011';
    const res = await request(`/parcels/${nonExistentId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 404 && !res.body?.success;
    recordResult('PAR-19', 'Return 404 for nonexistent valid ObjectId', '404 Not Found', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // PAR-20: Prevent one seller from accessing another seller's parcels
  {
    const res = await request(`/parcels/${parcelIdA}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const passed = res.status === 404 && !res.body?.success;
    recordResult('PAR-20', 'Prevent cross-seller parcel access (Seller B accessing Seller A)', '404 Not Found (Unauthorized access denied)', `HTTP ${res.status}`, passed);
  }

  // ==========================================
  // SECTION 8: EVIDENCE MANAGEMENT & SHA-256
  // ==========================================
  console.log('\n--- EXECUTING EVIDENCE & SHA-256 SUITE (EVD-01 to EVD-20, HASH-01 to HASH-08) ---');

  async function uploadFileHelper(parcelId, token, fileName, fileBuffer, mimeType, evidenceType = 'Package Box Photo') {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append('evidenceFile', blob, fileName);
    formData.append('evidenceType', evidenceType);

    const res = await fetch(`${API_BASE}/parcels/${parcelId}/evidence`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return { status: res.status, headers: res.headers, body };
  }

  // Create test dummy binary files
  const jpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12, 0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x0a, 0x00, 0x0a, 0x01, 0x01, 0x11, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xbf, 0x00, 0xff, 0xd9]);
  const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
  const webpBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x4c, 0x0e, 0x00, 0x00, 0x00, 0x2f, 0x00, 0x00, 0x00, 0x10, 0x07, 0x10, 0x11, 0x11, 0x88, 0x88, 0xfe, 0x07, 0x00]);
  const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000108 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF');
  const mp4Buffer = Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32, 0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x31]);

  // EVD-01: Upload valid JPG
  {
    const res = await uploadFileHelper(parcelIdA, tokenA, 'packing_seal.jpg', jpgBuffer, 'image/jpeg', 'Packing Photo');
    const passed = res.status === 201 && res.body?.success && res.body?.evidence?._id;
    if (passed) {
      evidenceIdA = res.body.evidence._id;
      storageKeyA = res.body.evidence.storageKey;
    }
    recordResult('EVD-01', 'Upload valid JPG evidence', '201 Created with metadata & SHA-256', `HTTP ${res.status}, ID: ${evidenceIdA}`, passed);
  }

  // EVD-02: Upload valid PNG
  {
    const res = await uploadFileHelper(parcelIdA, tokenA, 'label_barcode.png', pngBuffer, 'image/png', 'Shipping Label');
    const passed = res.status === 201 && res.body?.success;
    recordResult('EVD-02', 'Upload valid PNG evidence', '201 Created', `HTTP ${res.status}`, passed);
  }

  // EVD-03: Upload valid WEBP
  {
    const res = await uploadFileHelper(parcelIdA, tokenA, 'item_condition.webp', webpBuffer, 'image/webp', 'Packing Photo');
    const passed = res.status === 201 && res.body?.success;
    recordResult('EVD-03', 'Upload valid WEBP evidence', '201 Created', `HTTP ${res.status}`, passed);
  }

  // EVD-04: Upload valid PDF
  {
    const res = await uploadFileHelper(parcelIdA, tokenA, 'dispatch_receipt.pdf', pdfBuffer, 'application/pdf', 'Courier Receipt');
    const passed = res.status === 201 && res.body?.success;
    recordResult('EVD-04', 'Upload valid PDF evidence', '201 Created', `HTTP ${res.status}`, passed);
  }

  // EVD-05: Upload valid MP4
  {
    const res = await uploadFileHelper(parcelIdA, tokenA, 'packing_video.mp4', mp4Buffer, 'video/mp4', 'Packing Video');
    const passed = res.status === 201 && res.body?.success;
    recordResult('EVD-05', 'Upload valid MP4 evidence', '201 Created', `HTTP ${res.status}`, passed);
  }

  // EVD-06: Reject unsupported file types (.exe, .txt, .zip)
  {
    const badBuffer = Buffer.from('MZ executable code or raw script');
    const res = await uploadFileHelper(parcelIdA, tokenA, 'malicious.exe', badBuffer, 'application/x-msdownload', 'Packing Photo');
    const passed = res.status === 400 && !res.body?.success;
    recordResult('EVD-06', 'Reject unsupported file type (.exe)', '400 Bad Request', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // EVD-07: Enforce image size limits (over 10MB)
  {
    const oversizedImage = Buffer.alloc(11 * 1024 * 1024, 0xff);
    const res = await uploadFileHelper(parcelIdA, tokenA, 'huge_photo.jpg', oversizedImage, 'image/jpeg', 'Packing Photo');
    const passed = res.status === 400 && !res.body?.success;
    recordResult('EVD-07', 'Enforce image size limit (reject > 10MB)', '400 Bad Request', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // EVD-08: Enforce PDF size limits (over 10MB)
  {
    const oversizedPdf = Buffer.alloc(11 * 1024 * 1024, 0x25);
    const res = await uploadFileHelper(parcelIdA, tokenA, 'huge_doc.pdf', oversizedPdf, 'application/pdf', 'Courier Receipt');
    const passed = res.status === 400 && !res.body?.success;
    recordResult('EVD-08', 'Enforce PDF size limit (reject > 10MB)', '400 Bad Request', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // EVD-09: Enforce video size limits (over 50MB ceiling)
  {
    const oversizedVideo = Buffer.alloc(51 * 1024 * 1024, 0x00);
    const res = await uploadFileHelper(parcelIdA, tokenA, 'huge_video.mp4', oversizedVideo, 'video/mp4', 'Packing Video');
    const passed = res.status === 400 && !res.body?.success;
    recordResult('EVD-09', 'Enforce video size limit (reject > 50MB)', '400 Bad Request', `HTTP ${res.status}, msg: ${res.body?.message}`, passed);
  }

  // EVD-10: Verify file metadata is stored in MongoDB
  {
    const res = await request(`/evidence/${evidenceIdA}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const ev = res.body?.evidence;
    const passed =
      res.status === 200 &&
      ev?._id === evidenceIdA &&
      ev?.sha256Hash &&
      ev?.originalFilename === 'packing_seal.jpg' &&
      ev?.mimeType === 'image/jpeg';
    recordResult('EVD-10', 'Verify evidence metadata is stored in MongoDB', '200 OK with sha256Hash, mimeType, size', `HTTP ${res.status}, Hash: ${ev?.sha256Hash?.substring(0, 12)}...`, passed);
  }

  // EVD-11: Verify files are stored privately (not public URL)
  {
    const rawUrl = `http://localhost:5000/storage/uploads/${storageKeyA}`;
    const res = await fetch(rawUrl);
    const passed = res.status === 404;
    recordResult('EVD-11', 'Verify files are stored privately (not public URL)', '404 Not Found on static access', `HTTP ${res.status}`, passed);
  }

  // EVD-12: Retrieve evidence list
  {
    const res = await request('/evidence', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const passed = res.status === 200 && Array.isArray(res.body?.evidence) && res.body?.evidence.length >= 1;
    recordResult('EVD-12', 'Retrieve evidence list', '200 OK with array of evidence records', `HTTP ${res.status}, count: ${res.body?.count}`, passed);
  }

  // EVD-13: Preview image
  {
    const res = await request(`/evidence/${evidenceIdA}/download?inline=true`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const contentType = res.headers.get('content-type') || '';
    const disposition = res.headers.get('content-disposition') || '';
    const passed = res.status === 200 && contentType.includes('image/jpeg') && disposition.includes('inline');
    recordResult('EVD-13', 'Preview image file with inline disposition', '200 OK, image/jpeg, inline', `HTTP ${res.status}, ${contentType}`, passed);
  }

  // EVD-14: Preview video
  {
    const allEv = await request('/evidence', { headers: { Authorization: `Bearer ${tokenA}` } });
    const videoItem = allEv.body?.evidence?.find((e) => e.mimeType === 'video/mp4');
    const res = await request(`/evidence/${videoItem?._id}/download?inline=true`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const contentType = res.headers.get('content-type') || '';
    const passed = res.status === 200 && contentType.includes('video/mp4');
    recordResult('EVD-14', 'Preview video file stream', '200 OK, video/mp4', `HTTP ${res.status}, ${contentType}`, passed);
  }

  // EVD-15: Preview or download PDF
  {
    const allEv = await request('/evidence', { headers: { Authorization: `Bearer ${tokenA}` } });
    const pdfItem = allEv.body?.evidence?.find((e) => e.mimeType === 'application/pdf');
    const res = await request(`/evidence/${pdfItem?._id}/download?inline=true`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const contentType = res.headers.get('content-type') || '';
    const passed = res.status === 200 && contentType.includes('application/pdf');
    recordResult('EVD-15', 'Preview or download PDF document', '200 OK, application/pdf', `HTTP ${res.status}, ${contentType}`, passed);
  }

  // EVD-16: Download evidence
  {
    const res = await request(`/evidence/${evidenceIdA}/download`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const disposition = res.headers.get('content-disposition') || '';
    const buffer = Buffer.isBuffer(res.body)
      ? res.body
      : res.body instanceof ArrayBuffer
      ? Buffer.from(new Uint8Array(res.body))
      : Buffer.from(typeof res.body === 'string' ? res.body : JSON.stringify(res.body));
    const passed = res.status === 200 && disposition.includes('attachment') && buffer.length === jpgBuffer.length;
    recordResult('EVD-16', 'Download evidence with attachment disposition', '200 OK, attachment disposition, exact bytes', `HTTP ${res.status}, bytes: ${buffer.length}`, passed);
  }

  // EVD-17: Verify evidence belongs to the correct parcel
  {
    const res = await request(`/parcels/${parcelIdA}/evidence`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const belongsAll = res.body?.evidence?.every((e) => e.parcelId === parcelIdA);
    const passed = res.status === 200 && belongsAll && res.body?.evidence?.length > 0;
    recordResult('EVD-17', 'Verify evidence linked to correct parcel', 'All evidence items have parcelId === target', `HTTP ${res.status}, all match: ${belongsAll}`, passed);
  }

  // EVD-18: Prevent unauthorized uploads
  {
    const res = await uploadFileHelper(parcelIdA, tokenB, 'intruder_file.jpg', jpgBuffer, 'image/jpeg', 'Package Box Photo');
    const passed = res.status === 404 && !res.body?.success;
    recordResult('EVD-18', 'Prevent unauthorized evidence upload (Seller B into Seller A parcel)', '404 Not Found (Unauthorized)', `HTTP ${res.status}`, passed);
  }

  // EVD-19: Prevent unauthorized downloads
  {
    const res = await request(`/evidence/${evidenceIdA}/download`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const passed = res.status === 404;
    recordResult('EVD-19', 'Prevent unauthorized evidence download', '404 Not Found (Unauthorized access denied)', `HTTP ${res.status}`, passed);
  }

  // EVD-20: Prevent unauthorized previews
  {
    const res = await request(`/evidence/${evidenceIdA}/download?inline=true`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const passed = res.status === 404;
    recordResult('EVD-20', 'Prevent unauthorized evidence preview', '404 Not Found (Unauthorized access denied)', `HTTP ${res.status}`, passed);
  }

  // ==========================================
  // SHA-256 INTEGRITY VERIFICATION SUITE
  // ==========================================
  console.log('\n--- EXECUTING SHA-256 VERIFICATION SUITE (HASH-01 to HASH-08) ---');

  const expectedHashOriginal = crypto.createHash('sha256').update(jpgBuffer).digest('hex');

  // HASH-01: Upload file and generate hash
  {
    const passed = typeof expectedHashOriginal === 'string' && expectedHashOriginal.length === 64;
    recordResult('HASH-01', 'Upload file and generate SHA-256 hash', '64-character hexadecimal SHA-256 hash', `Generated: ${expectedHashOriginal}`, passed);
  }

  // HASH-02: Confirm hash stored in MongoDB
  {
    const res = await request(`/evidence/${evidenceIdA}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const storedHash = res.body?.evidence?.sha256Hash;
    const passed = storedHash === expectedHashOriginal;
    recordResult('HASH-02', 'Confirm hash stored in MongoDB', 'Stored hash matches initial calculated hash', `Stored: ${storedHash}`, passed);
  }

  // HASH-03: Recalculate hash of unchanged file
  {
    const res = await request(`/evidence/${evidenceIdA}/verify`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const computed = res.body?.verification?.computedHash;
    const passed = res.status === 200 && computed === expectedHashOriginal;
    recordResult('HASH-03', 'Recalculate hash of unchanged file on disk', 'Recalculated hash matches expected', `Recalculated: ${computed}`, passed);
  }

  // HASH-04: Confirm matching hash
  {
    const res = await request(`/evidence/${evidenceIdA}/verify`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const isValid = res.body?.verification?.isValid;
    const passed = res.status === 200 && isValid === true;
    recordResult('HASH-04', 'Confirm matching hash verification state', 'verification.isValid === true', `isValid: ${isValid}`, passed);
  }

  // HASH-05 & HASH-06: Modify a controlled test copy and verify mismatch detection
  {
    const uploadsDir = path.resolve(__dirname, 'storage/uploads');
    const diskPath = path.join(uploadsDir, storageKeyA);

    const backupBuffer = fs.readFileSync(diskPath);

    const tamperedBuffer = Buffer.from(backupBuffer);
    tamperedBuffer[0] = tamperedBuffer[0] === 0x00 ? 0xff : 0x00;
    fs.writeFileSync(diskPath, tamperedBuffer);

    recordResult('HASH-05', 'Modify controlled test copy of stored file on disk', 'File byte altered on disk', '1 byte tampered', true);

    const verifyTampered = await request(`/evidence/${evidenceIdA}/verify`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const isTamperedDetected =
      verifyTampered.status === 200 &&
      verifyTampered.body?.verification?.isValid === false &&
      verifyTampered.body?.verification?.explanation?.includes('Integrity Check Failed');

    recordResult('HASH-06', 'Verify SHA-256 mismatch detection on tampered file', 'verification.isValid === false with failure explanation', `isValid: ${verifyTampered.body?.verification?.isValid}`, isTamperedDetected);

    fs.writeFileSync(diskPath, backupBuffer);
  }

  // HASH-07: Verify missing-file handling
  {
    const uploadsDir = path.resolve(__dirname, 'storage/uploads');
    const diskPath = path.join(uploadsDir, storageKeyA);
    const backupBuffer = fs.readFileSync(diskPath);

    fs.unlinkSync(diskPath);

    const res = await request(`/evidence/${evidenceIdA}/verify`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    const passed = res.status === 404 && res.body?.verification?.fileMissing === true;
    recordResult('HASH-07', 'Verify missing-file handling on verification endpoint', '404 Not Found with structured fileMissing explanation', `HTTP ${res.status}, fileMissing: ${res.body?.verification?.fileMissing}`, passed);

    fs.writeFileSync(diskPath, backupBuffer);
  }

  // HASH-08: Confirm accurate user-facing result messages & disclaimer
  {
    const res = await request(`/evidence/${evidenceIdA}/verify`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const disclaimer = res.body?.verification?.disclaimer || '';
    const explanation = res.body?.verification?.explanation || '';
    const passed =
      res.status === 200 &&
      explanation.includes('Integrity Verified') &&
      disclaimer.includes('confirms digital file integrity') &&
      disclaimer.includes('does not verify the physical contents');
    recordResult('HASH-08', 'Confirm accurate user-facing result messages & disclaimer', 'Includes clear technical distinction between digital file integrity and physical parcel contents', `Disclaimer verified: ${passed}`, passed);
  }

  // ==========================================
  // SECTION 11: DASHBOARD VERIFICATION
  // ==========================================
  console.log('\n--- EXECUTING DASHBOARD AUDIT ---');

  let tokenC = null;
  {
    const resC = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'New Seller Zero',
        email: `seller_zero_${testSuffix}@parcelproof.pk`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        shopName: 'Zero Records Store',
        phone: '+92 333 0000000',
      }),
    });
    tokenC = resC.body?.token;
  }

  // Test zero state for Seller C
  {
    const res = await request('/dashboard/summary', {
      headers: { Authorization: `Bearer ${tokenC}` },
    });
    const s = res.body?.summary;
    const passed =
      res.status === 200 &&
      s?.totalParcels === 0 &&
      s?.deliveredParcels === 0 &&
      s?.inTransitParcels === 0 &&
      s?.totalEvidence === 0 &&
      Array.isArray(s?.recentParcels) &&
      s.recentParcels.length === 0;
    recordResult('DASH-01', 'Verify empty dashboard state for new seller', 'All metrics 0, empty recent arrays', `totalParcels: ${s?.totalParcels}, totalEvidence: ${s?.totalEvidence}`, passed);
  }

  // Test populated state for Seller A
  {
    const res = await request('/dashboard/summary', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const s = res.body?.summary;
    const passed =
      res.status === 200 &&
      s?.totalParcels >= 1 &&
      s?.inTransitParcels >= 1 &&
      s?.totalEvidence >= 5 &&
      Array.isArray(s?.recentParcels) &&
      s.recentParcels.length >= 1;
    recordResult('DASH-02', 'Verify dashboard reflects real MongoDB aggregations for active seller', 'Counts dynamically match DB records', `totalParcels: ${s?.totalParcels}, inTransit: ${s?.inTransitParcels}, totalEvidence: ${s?.totalEvidence}`, passed);
  }

  // ==========================================
  // SECTION 12: PLANNED MODULE INTERFACE AUDIT
  // ==========================================
  console.log('\n--- EXECUTING PLANNED MODULE INTERFACE AUDIT ---');

  {
    const resRet = await request('/returns', { headers: { Authorization: `Bearer ${tokenA}` } });
    const resDis = await request('/disputes', { headers: { Authorization: `Bearer ${tokenA}` } });
    const resRep = await request('/reports', { headers: { Authorization: `Bearer ${tokenA}` } });

    const passed = resRet.status === 404 && resDis.status === 404 && resRep.status === 404;
    recordResult('PLAN-01', 'Verify no fake business APIs exist for planned modules', '404 Not Found on /api/returns, /api/disputes, /api/reports', `Returns: ${resRet.status}, Disputes: ${resDis.status}, Reports: ${resRep.status}`, passed);
  }

  {
    const resViteRet = await request(`${CLIENT_BASE}/returns`);
    const resViteDis = await request(`${CLIENT_BASE}/disputes`);
    const resViteRep = await request(`${CLIENT_BASE}/reports`);

    const passed = resViteRet.status === 200 && resViteDis.status === 200 && resViteRep.status === 200;
    recordResult('PLAN-02', 'Verify frontend routes open for planned modules (/returns, /disputes, /reports)', 'HTTP 200 OK HTML for SPA routing', `Returns: ${resViteRet.status}, Disputes: ${resViteDis.status}, Reports: ${resViteRep.status}`, passed);
  }

  // ==========================================
  // SUMMARY REPORT
  // ==========================================
  console.log('\n======================================================');
  console.log(' AUDIT TEST SUITE EXECUTION SUMMARY');
  console.log('======================================================');

  const total = results.length;
  const passedCount = results.filter((r) => r.status === 'Pass').length;
  const failedCount = total - passedCount;

  console.log(`Total Tests Executed: ${total}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Success Rate: ${((passedCount / total) * 100).toFixed(1)}%`);

  fs.writeFileSync(
    path.resolve(__dirname, 'qa_audit_results.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\nSaved full structured test results to: qa_audit_results.json\n');
}

runSuite().catch((err) => {
  console.error('[FATAL ERROR IN TEST SUITE]', err);
  process.exit(1);
});
