import { NextResponse } from "next/server";
import { authMiddleware } from "./middlewares/api/authMiddleware";
import { logMiddleware } from "./middlewares/api/logMiddleware";

export const config = {
    matcher: '/api/:path*',
};

export default function middleware(request: Request) {
    // if (request.url.includes('/api/blogs')) {
    //     const logResult = logMiddleware(request);
    //     console.log(logResult.response);
    // }

    const authResult = authMiddleware(request);
    // if(!authResult?.isValid && request.url.includes('/api/blogs/')) // <-- this condition for a spesifics endpoint
    if(!authResult?.isValid) // <-- while this condition for common/all endpoints
        {
        return new NextResponse(JSON.stringify({
            message: 'Unauthorized',
        }), {status: 401});
    }
    const logResult = logMiddleware(request);
    console.log(logResult.response);
    return NextResponse.next();
}