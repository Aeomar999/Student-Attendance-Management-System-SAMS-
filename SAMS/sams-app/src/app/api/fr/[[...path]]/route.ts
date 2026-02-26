import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAccountLockout, recordFailedLogin, clearFailedLoginAttempts } from "@/lib/security";

const FR_API_URL = process.env.FR_API_URL || "http://localhost:8000";

async function proxyToFR(endpoint: string, body: unknown, method: string = "POST") {
    const response = await fetch(`${FR_API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
}

export async function POST(request: NextRequest) {
    const session = await auth();
    
    if (!session?.user?.id) {
        return NextResponse.json(
            { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
            { status: 401 }
        );
    }

    const lockoutCheck = await checkAccountLockout(session.user.id);
    if (lockoutCheck.locked) {
        return NextResponse.json(
            { success: false, error: { code: "ACCOUNT_LOCKED", message: lockoutCheck.reason } },
            { status: 423 }
        );
    }

    try {
        const body = await request.json();
        const path = request.nextUrl.pathname.replace("/api/fr", "");

        const response = await fetch(`${FR_API_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": session.user.id,
                "X-User-Role": session.user.role || "",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error?.code === "FR_ERROR") {
                await recordFailedLogin(session.user.id);
            }
            return NextResponse.json(data, { status: response.status });
        }

        await clearFailedLoginAttempts(session.user.id);
        return NextResponse.json(data);

    } catch (error) {
        console.error("FR API proxy error:", error);
        return NextResponse.json(
            { success: false, error: { code: "FR_SERVICE_ERROR", message: "Face recognition service unavailable" } },
            { status: 503 }
        );
    }
}

export async function GET() {
    const session = await auth();
    
    if (!session?.user?.id) {
        return NextResponse.json(
            { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
            { status: 401 }
        );
    }

    return proxyToFR("/health", {}, "GET");
}
