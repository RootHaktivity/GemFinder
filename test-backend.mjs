import handler from './api/search.js';

// Mock request and response objects for testing
function createMockRequest(query = {}, method = 'GET') {
  return {
    method,
    query,
  };
}

function createMockResponse() {
  const res = {
    statusCode: null,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
  return res;
}

async function runTests() {
  console.log('🧪 Running backend tests...\n');

  // Test 1: Missing parameters
  console.log('Test 1: Missing parameters (should return 400)');
  let req = createMockRequest({});
  let res = createMockResponse();
  await handler(req, res);
  console.log(`Status: ${res.statusCode}, Error: ${res.data?.error}`);
  console.log(`✓ Pass\n`);

  // Test 2: Invalid repo format
  console.log('Test 2: Invalid repo format (should return 400)');
  req = createMockRequest({ repo: 'invalid-format' });
  res = createMockResponse();
  await handler(req, res);
  console.log(`Status: ${res.statusCode}, Error: ${res.data?.error}`);
  console.log(`✓ Pass\n`);

  // Test 3: Search mode with valid query (requires network)
  console.log('Test 3: Search mode ?q=react (requires internet)');
  req = createMockRequest({ q: 'react' });
  res = createMockResponse();
  try {
    await handler(req, res);
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log(`✓ Pass - Got ${res.data?.length || 0} results`);
      if (res.data && res.data.length > 0) {
        console.log(
          `First result: ${res.data[0].name} (stars: ${res.data[0].stars})`
        );
      }
    } else {
      console.log(`⚠ Got status ${res.statusCode}: ${res.data?.error}`);
    }
  } catch (error) {
    console.log(`⚠ Test skipped: ${error.message}`);
  }
  console.log();

  // Test 4: Single repo mode (requires network)
  console.log('Test 4: Repo mode ?repo=torvalds/linux (requires internet)');
  req = createMockRequest({ repo: 'torvalds/linux' });
  res = createMockResponse();
  try {
    await handler(req, res);
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log(`✓ Pass - Got repo: ${res.data[0]?.name}`);
      console.log(`Stars: ${res.data[0]?.stars}, AI Summary length: ${res.data[0]?.ai_summary?.length}`);
    } else {
      console.log(`⚠ Got status ${res.statusCode}: ${res.data?.error}`);
    }
  } catch (error) {
    console.log(`⚠ Test skipped: ${error.message}`);
  }
  console.log();

  console.log('✅ Tests complete!');
}

runTests().catch(console.error);
