import { NextResponse } from "next/server";

export async function GET(req) {
    const peerConfig = {
        iceServers: [
            { urls: "stun:stun.cloudflare.com:3478" },
            {
                username: process.env.ICE_SERVER_USERNAME,
                credential: process.env.ICE_SERVER_CREDENTIAL,
                urls: "turn:turn.cloudflare.com:3478?transport=tcp",
            },
            {
                username: process.env.ICE_SERVER_USERNAME,
                credential: process.env.ICE_SERVER_CREDENTIAL,
                urls: "turn:turn.cloudflare.com:3478?transport=udp",
            },
        ],
    };

    return NextResponse.json({peerConfig})
}
