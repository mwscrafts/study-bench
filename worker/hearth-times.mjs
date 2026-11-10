import { DurableObject } from 'cloudflare:workers';

const PATH = '/first-hearth/api/times';
const response = (data, status = 200) => Response.json(data, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});

async function readEntry(request) {
  if (!request.body || !request.headers.get('Content-Type')?.startsWith('application/json')) return null;
  const reader = request.body.getReader();
  const bytes = new Uint8Array(512);
  let count = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    if (count + value.length > bytes.length) {
      await reader.cancel();
      return null;
    }
    bytes.set(value, count);
    count += value.length;
  }
  try {
    const { runId, timeMs, name: rawName } = JSON.parse(new TextDecoder().decode(bytes.subarray(0,count)));
    const name = typeof rawName === 'string' ? rawName.trim().normalize('NFC') : '';
    if (typeof runId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(runId)
      || !Number.isSafeInteger(timeMs) || timeMs < 1000 || timeMs > 3600000
      || name.length > 20 || !/^[\p{L}\p{M}\p{N} ._'’-]+$/u.test(name) || !/[\p{L}\p{N}]/u.test(name)) return null;
    return { runId, timeMs, name };
  } catch {
    return null;
  }
}

export class HearthTimes extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS times (
      runId TEXT PRIMARY KEY, ending TEXT NOT NULL, timeMs INTEGER NOT NULL, name TEXT NOT NULL
    )`);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const ending = url.searchParams.get('ending');
    if (!['break','free','break-hard','free-hard'].includes(ending)) return response({ error: 'Unknown ending' }, 400);
    const scores = () => this.sql.exec(
      'SELECT name, timeMs FROM times WHERE ending = ? ORDER BY timeMs, runId LIMIT 20', ending
    ).toArray();
    if (request.method === 'GET') return response({ scores: scores() });
    if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405);
    if (request.headers.get('Origin') !== url.origin) return response({ error: 'Origin not allowed' }, 403);
    const entry = await readEntry(request);
    if (!entry) return response({ error: 'Invalid time entry' }, 400);
    this.sql.exec('INSERT OR IGNORE INTO times (runId, ending, timeMs, name) VALUES (?, ?, ?, ?)',
      entry.runId, ending, entry.timeMs, entry.name);
    const posted = this.sql.exec('SELECT ending, name FROM times WHERE runId = ?', entry.runId).one();
    if (posted.ending !== ending) return response({ error: 'This run already posted to another board' }, 409);
    this.sql.exec(`DELETE FROM times WHERE runId IN (
      SELECT runId FROM times WHERE ending = ? ORDER BY timeMs, runId LIMIT -1 OFFSET 50
    )`, ending);
    return response({ scores: scores(), postedName: posted.name });
  }
}

export default {
  fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path !== PATH) return env.ASSETS.fetch(request);
    return env.HEARTH_TIMES.getByName('shared').fetch(request);
  }
};
