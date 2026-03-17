const { GET } = require('./src/app/api/cron/send-reminders/route');

async function test() {
  const req = {
    headers: new Map([['authorization', 'Bearer test']])
  };

  // mock process.env
  process.env.CRON_SECRET = 'test';

  try {
    const res = await GET(req);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
