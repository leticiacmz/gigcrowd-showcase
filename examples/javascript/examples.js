/**
 * Live, read-only GigCrowd API examples.
 *
 * Run from this directory with Node.js 18+:
 *   node examples.js
 *
 * These examples query current public API data. They do not create users,
 * import/synchronize artists, follow artists, or write to production.
 */

const GigCrowdClient = require('./api-client.js');
const client = new GigCrowdClient();

function normalise(value) {
  return String(value || '').toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
}

function hasFestival(event) {
  return event && event.festival && typeof event.festival === 'object'
    && Object.keys(event.festival).length > 0;
}

function isSoloShow(event) {
  return event && event.festival == null;
}

function includesCharliXcx(event) {
  return Array.isArray(event && event.artists)
    && event.artists.some((artist) => normalise(artist && artist.name) === 'charlixcx');
}

async function healthCheckExample() {
  const health = await client.healthCheck();
  console.log('\n=== Live API Health ===');
  console.log(JSON.stringify(health, null, 2));
}

async function charliXcxExample() {
  const result = await client.unifiedSearch({ q: 'Charli XCX', limit: 20 });
  const artist = (Array.isArray(result.artists) ? result.artists : [])
    .find((item) => normalise(item && item.name) === 'charlixcx');

  console.log('\n=== Charli XCX: Live Search Result ===');
  if (artist) {
    console.log(JSON.stringify(artist, null, 2));
  } else {
    console.warn('The live search did not return an exact Charli XCX match.');
    console.log(JSON.stringify({ query: result.query, artists_unavailable: result.artists_unavailable, artists: result.artists || [] }, null, 2));
  }
  return result;
}

async function soloEventExample(charliSearch) {
  const charliEvents = Array.isArray(charliSearch.events) ? charliSearch.events : [];
  let event = charliEvents.find((item) => isSoloShow(item) && includesCharliXcx(item));

  if (!event) {
    const result = await client.searchEvents({ q: 'Charli XCX', includePast: true, limit: 50 });
    const rows = Array.isArray(result.events) ? result.events : [];
    event = rows.find((item) => isSoloShow(item) && includesCharliXcx(item));
  }

  if (!event) {
    const result = await client.searchEvents({ includePast: true, limit: 50 });
    const rows = Array.isArray(result.events) ? result.events : [];
    event = rows.find(isSoloShow);
  }

  console.log('\n=== Real Individual Show from the Catalogue ===');
  if (event) console.log(JSON.stringify(event, null, 2));
  else console.warn('No individual show was returned by the live catalogue queries.');
  return event || null;
}

async function festivalExample(charliSearch) {
  const charliEvents = Array.isArray(charliSearch.events) ? charliSearch.events : [];
  let event = charliEvents.find((item) => hasFestival(item) && includesCharliXcx(item));

  if (!event) {
    const result = await client.searchEvents({ q: 'festival', includePast: true, limit: 50 });
    const rows = Array.isArray(result.events) ? result.events : [];
    event = rows.find(hasFestival);
  }

  if (!event) {
    const result = await client.searchEvents({ includePast: true, limit: 50 });
    const rows = Array.isArray(result.events) ? result.events : [];
    event = rows.find(hasFestival);
  }

  console.log('\n=== Real Festival Edition from the Catalogue ===');
  if (event) {
    console.log(JSON.stringify(event, null, 2));
    console.log(`Charli XCX in this event's artist list: ${includesCharliXcx(event)}`);
  } else {
    console.warn('No festival edition was returned by the live catalogue queries.');
  }
  return event || null;
}

async function main() {
  console.log('GigCrowd API: live read-only examples');
  await healthCheckExample();
  const charliSearch = await charliXcxExample();
  await soloEventExample(charliSearch);
  await festivalExample(charliSearch);
  console.log('\nFinished. Only GET requests were sent.');
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`GigCrowd API example failed: ${error.message}`);
    if (error.status) console.error(`HTTP status: ${error.status}`);
    process.exitCode = 1;
  });
}

module.exports = {
  charliXcxExample,
  festivalExample,
  healthCheckExample,
  includesCharliXcx,
  isSoloShow,
  main,
  soloEventExample,
};
