import { NextResponse } from "next/server";
import axios from 'axios';

export async function GET(req) {
    const TURN_KEY_ID = process.env.TURN_KEY_ID; // Your TURN key ID
    const TURN_KEY_API_TOKEN = process.env.TURN_KEY_API_TOKEN; // Your API token
    
    // Fallback ICE servers (STUN only) if TURN credentials fail
    const fallbackIceServers = [
        {
            "urls": "stun:stun.cloudflare.com:3478"
        },
        {
            "urls": "stun:stun.cloudflare.com:53"
        },
        {
            "urls": "stun:stun.l.google.com:19302"
        }
    ];

    // If TURN credentials are not configured, return fallback servers
    if (!TURN_KEY_ID || !TURN_KEY_API_TOKEN) {
        console.warn('TURN_KEY_ID or TURN_KEY_API_TOKEN not configured. Using fallback STUN servers.');
        return NextResponse.json({ formattedIceServers: fallbackIceServers });
    }

    try {
        // Call Cloudflare API to generate TURN credentials
        const response = await axios.post(
            `https://rtc.live.cloudflare.com/v1/turn/keys/${TURN_KEY_ID}/credentials/generate`,
            { ttl: 21600 },
            {
                headers: {
                    Authorization: `Bearer ${TURN_KEY_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extract the generated ICE servers from the response
        const { iceServers } = response.data;

        if (!iceServers || !iceServers.username || !iceServers.credential) {
            console.warn('Invalid TURN credentials received. Using fallback STUN servers.');
            return NextResponse.json({ formattedIceServers: fallbackIceServers });
        }

        const formattedIceServers = [
            {
                "urls": "stun:stun.cloudflare.com:3478"
            },
            {
                "urls": "stun:stun.cloudflare.com:53"
            },
            {
                "urls": "turn:turn.cloudflare.com:3478?transport=udp",
                username: iceServers.username,
                credential: iceServers.credential,
            },
            {
                "urls": "turn:turn.cloudflare.com:53?transport=udp",
                username: iceServers.username,
                credential: iceServers.credential,
            },
            {
                "urls": "turn:turn.cloudflare.com:3478?transport=tcp",
                username: iceServers.username,
                credential: iceServers.credential,
            },
            {
                "urls": "turn:turn.cloudflare.com:80?transport=tcp",
                username: iceServers.username,
                credential: iceServers.credential,
            },
            {
                "urls": "turns:turn.cloudflare.com:5349?transport=tcp",
                username: iceServers.username,
                credential: iceServers.credential,
            },
            {
                "urls": "turns:turn.cloudflare.com:443?transport=tcp",
                username: iceServers.username,
                credential: iceServers.credential,
            }
        ]

        // Return the iceServers in the response
        return NextResponse.json({ formattedIceServers });

    } catch (error) {
        console.error('Error generating TURN credentials:', error.response?.data || error.message);
        // Return fallback servers instead of failing completely
        console.warn('Using fallback STUN servers due to TURN credential error.');
        return NextResponse.json({ formattedIceServers: fallbackIceServers });
    }
}

// import { NextResponse } from "next/server";

// export async function GET(req) {
//     const peerConfig = {
//         iceServers: [
//             { urls: "stun:stun.cloudflare.com:3478" },
//             {
//                 username: 0bd0ae4ea6fe483e09f6d7ce4966f437fd7008ffc9f700bdf2c84d85e455bfbf,
//                 credential: 468124559d015f287c45aa3973b7221303aa9f187405faa7b6a9007ac5419c08,
//                 urls: "turn:turn.cloudflare.com:3478?transport=tcp",
//             },
//             {
//                 username: 0bd0ae4ea6fe483e09f6d7ce4966f437fd7008ffc9f700bdf2c84d85e455bfbf,
//                 credential: 468124559d015f287c45aa3973b7221303aa9f187405faa7b6a9007ac5419c08,
//                 urls: "turn:turn.cloudflare.com:3478?transport=udp",
//             },
//         ],
//     };

//     return NextResponse.json({peerConfig})
// }
