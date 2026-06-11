import { next } from '@vercel/edge';

export const config = { matcher: '/(.*)' };

export default function middleware(request) {
  const expected = process.env.STUDIO_PASSWORD || '';
  const auth = request.headers.get('authorization') || '';

  if (expected && auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const i = decoded.indexOf(':');
      const user = decoded.slice(0, i);
      const pass = decoded.slice(i + 1);
      if (user === 'rdk' && pass === expected) {
        return next();
      }
    } catch (e) { /* nevažeći header — pada na 401 ispod */ }
  }

  const poruka = expected
    ? 'RDK Studio — potrebna prijava.'
    : 'STUDIO_PASSWORD nije podešen u Vercel Environment Variables.';

  return new Response(poruka, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="RDK Studio", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
