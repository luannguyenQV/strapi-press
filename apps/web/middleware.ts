import { internationalizationMiddleware } from '@repo/internationalization/middleware';
import { type NextRequest } from 'next/server';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

const middleware = (request: NextRequest) => {
  return internationalizationMiddleware(request);
};

export default middleware;
