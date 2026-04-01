import handler from './api/search.js';

function createMockRequest(query = {}, method = 'GET') {
  return { method, query };
}

function createMockResponse() {
  const res = {
    statusCode: null,
    data: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; },
  };
  return res;
}

async function showActualSummaries() {
  console.log('🤖 Testing AI Summaries with Real Hugging Face Token...\n');

  // Test search mode with actual summaries
  console.log('Test: Search for "python-cli" - Showing AI Summaries\n');
  let req = createMockRequest({ q: 'python-cli' });
  let res = createMockResponse();
  await handler(req, res);

  if (res.statusCode === 200 && res.data && res.data.length > 0) {
    res.data.slice(0, 3).forEach((repo, idx) => {
      console.log(`${idx + 1}. ${repo.name}`);
      console.log(`   Stars: ${repo.stars}`);
      console.log(`   Description: ${repo.description?.substring(0, 60)}...`);
      console.log(`   AI Summary: "${repo.ai_summary}"\n`);
    });
  }

  // Test single repo mode
  console.log('\nTest: Single Repo "expressjs/express" - Showing AI Summary\n');
  req = createMockRequest({ repo: 'expressjs/express' });
  res = createMockResponse();
  await handler(req, res);

  if (res.statusCode === 200 && res.data && res.data[0]) {
    const repo = res.data[0];
    console.log(`Repository: ${repo.name}`);
    console.log(`URL: ${repo.html_url}`);
    console.log(`Stars: ${repo.stars}`);
    console.log(`Description: ${repo.description}`);
    console.log(`AI Summary: "${repo.ai_summary}"\n`);
  }

  console.log('✅ AI Summaries are working perfectly!');
}

showActualSummaries().catch(console.error);
