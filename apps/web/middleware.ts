import { env } from '@/env';
import { authMiddleware } from '@repo/auth/middleware';
import { internationalizationMiddleware } from '@repo/internationalization/middleware';
import {
  type NextMiddleware,
  type NextRequest,
  NextResponse
} from 'next/server';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};



const middleware = authMiddleware(async (request) => {
  const i18nResponse = internationalizationMiddleware(
    request as unknown as NextRequest
  );
  if (i18nResponse) {
    return i18nResponse;
  }

  return NextResponse.next();
}) as unknown as NextMiddleware;

export default middleware;
