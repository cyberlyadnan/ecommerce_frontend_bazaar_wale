const VISITOR_ID_KEY = 'b2b_visitor_id';
const SESSION_ID_KEY = 'b2b_session_id';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = generateId();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}
