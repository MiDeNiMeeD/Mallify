const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export const formatRelativeTime = (input) => {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < MIN) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MIN)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d`;
  return d.toLocaleDateString();
};

export const formatClockTime = (input) => {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return 'offline';
  const ts = typeof lastSeen === 'number' ? lastSeen : Number(lastSeen);
  if (!ts) return 'offline';
  const diff = Date.now() - ts;
  if (diff < MIN) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MIN)} min ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} h ago`;
  return new Date(ts).toLocaleDateString();
};

export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

export const groupMessagesByDay = (messages) => {
  const groups = [];
  let lastKey = null;
  for (const m of messages) {
    const d = new Date(m.createdAt);
    const key = d.toDateString();
    if (key !== lastKey) {
      groups.push({ type: 'date', key, label: formatDayLabel(d), id: `date-${key}` });
      lastKey = key;
    }
    groups.push({ type: 'message', message: m, id: m._id });
  }
  return groups;
};

const formatDayLabel = (d) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Today';
  if (same(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
};
