// =============================================================================
// config/dns-srv.js
// Lab 6 helper: SRV record resolver over DNS-over-HTTPS (DoH)
//
// Why this file exists:
// The campus network DNS server does not answer DNS SRV queries
// (querySrv ECONNREFUSED on _mongodb._tcp.cluster0.rf7rx3t.mongodb.net),
// which the MongoDB driver needs in order to resolve a "mongodb+srv://"
// connection string. This module overrides Node's dns.resolveSrv so the
// driver resolves the Atlas SRV record through a public DNS-over-HTTPS
// endpoint (JSON API) instead, with no changes to system settings.
//
// It is loaded once at the very top of server.js, before the driver runs.
// =============================================================================

const dns = require('dns');

const srvCache = new Map();

async function resolveSrvViaDoH(hostname, options) {
  // The driver may call this with (hostname) or (hostname, options);
  // normalise so a bare string is always used.
  if (typeof hostname === 'object' && hostname !== null) {
    options = hostname;
    hostname = options.name || options.hostname || '';
  }
  hostname = String(hostname).replace(/\.$/, '');
  if (srvCache.has(hostname)) return srvCache.get(hostname);

  // Public DNS-over-HTTPS endpoints (reachable from this network)
  const endpoints = [
    `https://223.5.5.5/resolve?name=${encodeURIComponent(hostname)}&type=SRV`,
    `https://1.1.1.1/dns-query?name=${encodeURIComponent(hostname)}&type=SRV`,
    `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=SRV`,
  ];
  const errors = [];
  // Two full passes over the endpoints: public DoH can hiccup momentarily.
  for (let attempt = 0; attempt < 2; attempt++) {
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/dns-json' },
        signal: AbortSignal.timeout(8000),
      });
      const data = await res.json();
      const answers = data.Answer || data.answer || [];
      const records = [];
      for (const a of answers) {
        if ((a.type === 33 || a.type === '33') && a.data) {
          // SRV rdata text: "priority weight port target"
          const [priority, weight, port, target] = a.data.trim().split(/\s+/);
          records.push({
            name: String(target).replace(/\.$/, ''),
            port: Number(port),
            priority: Number(priority),
            weight: Number(weight),
          });
        }
      }
      if (records.length) {
        srvCache.set(hostname, records);
        return records;
      }
      errors.push(url + ' -> no SRV answers (Status=' + data.Status + ')');
    } catch (e) {
      errors.push(url + ' -> ' + (e && e.message));
    }
  }
    await new Promise((r) => setTimeout(r, 800));
  }
  const err = new Error('ENOTFOUND SRV ' + hostname + ' | ' + errors.join(' ; '));
  err.code = 'ENOTFOUND';
  throw err;
}

// --- TXT records (the driver also queries "authSource"/"replicaSet" TXT) ---
const txtCache = new Map();

async function resolveTxtViaDoH(hostname, options) {
  if (typeof hostname === 'object' && hostname !== null) {
    options = hostname;
    hostname = options.name || options.hostname || '';
  }
  hostname = String(hostname).replace(/\.$/, '');
  if (txtCache.has(hostname)) return txtCache.get(hostname);
  const endpoints = [
    `https://223.5.5.5/resolve?name=${encodeURIComponent(hostname)}&type=TXT`,
    `https://1.1.1.1/dns-query?name=${encodeURIComponent(hostname)}&type=TXT`,
    `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=TXT`,
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/dns-json' },
        signal: AbortSignal.timeout(6000),
      });
      const data = await res.json();
      const answers = data.Answer || data.answer || [];
      const records = [];
      for (const a of answers) {
        if (a.type === 16 || a.type === '16') {
          // TXT rdata text, strip surrounding quotes; driver expects string array
          records.push(String(a.data).replace(/"/g, ''));
        }
      }
      txtCache.set(hostname, records);
      return records;
    } catch (e) {
      // try next endpoint
    }
  }
  // No TXT record found is a legal outcome for Atlas SRV lookups.
  const err = new Error('ENODATA TXT ' + hostname);
  err.code = 'ENODATA';
  throw err;
}

// Patch both the callback-style and promise-style APIs used by the driver.
dns.resolveSrv = function (hostname, optionsOrCb, maybeCb) {
  const cb = typeof optionsOrCb === 'function' ? optionsOrCb : maybeCb;
  resolveSrvViaDoH(hostname)
    .then((records) => process.nextTick(() => cb(null, records)))
    .catch((err) => process.nextTick(() => cb(err)));
};
dns.promises.resolveSrv = resolveSrvViaDoH;

const originalResolveTxt = dns.resolveTxt;
dns.resolveTxt = function (hostname, optionsOrCb, maybeCb) {
  const cb = typeof optionsOrCb === 'function' ? optionsOrCb : maybeCb;
  resolveTxtViaDoH(hostname)
    .then((records) => process.nextTick(() => cb(null, records.map((r) => [r]))))
    .catch((err) => process.nextTick(() => cb(err)));
};
dns.promises.resolveTxt = async function (hostname) {
  const records = await resolveTxtViaDoH(hostname);
  return records.map((r) => [r]);
};

module.exports = { resolveSrvViaDoH, resolveTxtViaDoH, originalResolveTxt };
