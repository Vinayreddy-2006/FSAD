// simple wrapper around localStorage for drives, donations, requests, deliveries

const STORAGE_KEYS = {
  drives: 'reliefconnect_drives',
  donations: 'reliefconnect_donations',
  requests: 'reliefconnect_requests',
  deliveries: 'reliefconnect_deliveries',
  messages: 'reliefconnect_messages',
  feedback: 'reliefconnect_feedback',
  users: 'reliefconnect_users',
};

function read(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('storage read failed', e);
    return [];
  }
}

function write(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

export const drives = {
  all: () => read(STORAGE_KEYS.drives),
  add: (drive) => {
    const arr = read(STORAGE_KEYS.drives);
    arr.push(drive);
    write(STORAGE_KEYS.drives, arr);
  },
};

export const donations = {
  all: () => read(STORAGE_KEYS.donations),
  add: (donation) => {
    const arr = read(STORAGE_KEYS.donations);
    arr.push(donation);
    write(STORAGE_KEYS.donations, arr);
  },
  update: (id, changes) => {
    let arr = read(STORAGE_KEYS.donations);
    arr = arr.map((d) => (d.id === id ? { ...d, ...changes } : d));
    write(STORAGE_KEYS.donations, arr);
  },
  // convenience statistics
  countByStatus: () => {
    const arr = read(STORAGE_KEYS.donations);
    return arr.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {});
  },
};

export const requests = {
  all: () => read(STORAGE_KEYS.requests),
  add: (req) => {
    const arr = read(STORAGE_KEYS.requests);
    arr.push(req);
    write(STORAGE_KEYS.requests, arr);
  },
  update: (id, changes) => {
    let arr = read(STORAGE_KEYS.requests);
    arr = arr.map((r) => (r.id === id ? { ...r, ...changes } : r));
    write(STORAGE_KEYS.requests, arr);
  },
};

export const deliveries = {
  all: () => read(STORAGE_KEYS.deliveries),
  add: (del) => {
    const arr = read(STORAGE_KEYS.deliveries);
    arr.push(del);
    write(STORAGE_KEYS.deliveries, arr);
  },
  update: (id, changes) => {
    let arr = read(STORAGE_KEYS.deliveries);
    arr = arr.map((d) => (d.id === id ? { ...d, ...changes } : d));
    write(STORAGE_KEYS.deliveries, arr);
  },
};

export const feedback = {
  all: () => read(STORAGE_KEYS.feedback),
  add: (fb) => {
    const arr = read(STORAGE_KEYS.feedback);
    arr.push(fb);
    write(STORAGE_KEYS.feedback, arr);
  },
};

export const messages = {
  all: () => read(STORAGE_KEYS.messages),
  add: (msg) => {
    const arr = read(STORAGE_KEYS.messages);
    arr.push(msg);
    write(STORAGE_KEYS.messages, arr);
  },
  update: (id, changes) => {
    let arr = read(STORAGE_KEYS.messages);
    arr = arr.map((m) => (m.id === id ? { ...m, ...changes } : m));
    write(STORAGE_KEYS.messages, arr);
  },
};

/* user helpers used for auth/register */
export const users = {
  all: () => read(STORAGE_KEYS.users),
  add: (u) => {
    const arr = read(STORAGE_KEYS.users);
    arr.push(u);
    write(STORAGE_KEYS.users, arr);
  },
  find: (predicate) => {
    const arr = read(STORAGE_KEYS.users);
    return arr.find(predicate);
  },
  update: (email, changes) => {
    let arr = read(STORAGE_KEYS.users);
    arr = arr.map((u) => (u.email === email ? { ...u, ...changes } : u));
    write(STORAGE_KEYS.users, arr);
  },
};
