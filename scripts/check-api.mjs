import { existsSync, readFileSync } from 'node:fs';

const envValues = {};

if (existsSync('.env')) {
  const envFile = readFileSync('.env', 'utf8');
  for (const line of envFile.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();
    envValues[key] = value;
  }
}

const normalizeBaseUrl = (url) => {
  const trimmedUrl = url.trim().replace(/\/$/, '');
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};

const configuredUrl = process.env.VITE_API_URL || envValues.VITE_API_URL || 'http://localhost:8081/api';
const baseUrl = normalizeBaseUrl(configuredUrl);
const endpoints = ['users', 'drives', 'donations', 'requests'];

console.log(`Checking backend: ${baseUrl}`);

let failed = false;

for (const endpoint of endpoints) {
  const url = `${baseUrl}/${endpoint}`;

  try {
    const response = await fetch(url);
    const status = `${response.status} ${response.statusText}`.trim();

    if (!response.ok) {
      failed = true;
      console.log(`FAIL ${endpoint}: ${status}`);
      continue;
    }

    const data = await response.json().catch(() => null);
    const count = Array.isArray(data) ? `${data.length} item(s)` : 'response received';
    console.log(`OK   ${endpoint}: ${status}, ${count}`);
  } catch (error) {
    failed = true;
    console.log(`FAIL ${endpoint}: ${error.message}`);
  }
}

if (failed) {
  console.log('\nBackend is not fully reachable. Check VITE_API_URL, backend status, HTTPS, and CORS.');
  process.exitCode = 1;
} else {
  console.log('\nBackend connection looks good.');
}
