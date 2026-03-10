import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Dashboard Protection (Stage 2)
    if (pathname.startsWith('/dashboard')) {
        const canAccessDashboard = request.cookies.get('canAccessDashboard')?.value === 'true';

        if (!canAccessDashboard) {
            console.log(`[PROXY BLOCK] Unauthorized dashboard access attempt to ${pathname}`);
            return NextResponse.redirect(new URL('/pricing', request.url));
        }
    }

    // 2. Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    const response = NextResponse.next();

    // 3. Add CORS headers to all responses
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
}

// Match API routes and Dashboard routes
export const config = {
    matcher: ['/api/:path*', '/dashboard/:path*'],
};
