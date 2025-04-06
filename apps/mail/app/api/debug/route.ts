import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || 'Not set',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set (hidden)' : 'Not set',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'Not set',
    betterAuthSecret: process.env.BETTER_AUTH_SECRET ? 'Set (hidden)' : 'Not set',
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'Not set',
    redisUrl: process.env.REDIS_URL || 'Not set',
    upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL || 'Not set',
    nodeEnv: process.env.NODE_ENV || 'Not set',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
  });
} 