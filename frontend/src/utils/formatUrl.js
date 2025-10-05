export default function formatUrl(raw){
  if (!raw) return '';
  try {
    const u = new URL(raw);
    const host = u.host.replace(/^www\./i, '');
    let path = u.pathname === '/' ? '' : u.pathname;
    if (u.search) path += u.search;
    if (path.length > 24) path = path.slice(0, 21) + '...';
    return host + (path ? path : '');
  } catch (err) {
    return raw.length > 30 ? raw.slice(0, 27) + '...' : raw;
  }
}
