import { NextResponse } from "next/server";
import axios from 'axios';

export async function GET(req) {
    const TURN_KEY_ID = process.env.TURN_KEY_ID; // Your TURN key ID
    const TURN_KEY_API_TOKEN = process.env.TURN_KEY_API_TOKEN; // Your API token
    try {
        // Call Cloudflare API to generate TURN credentials
        const response = await axios.post(
            `https://rtc.live.cloudflare.com/v1/turn/keys/${TURN_KEY_ID}/credentials/generate`,
            { ttl: 10800000 }, 
            {
                headers: {
                    Authorization: `Bearer ${TURN_KEY_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extract the generated ICE servers from the response
        const { iceServers } = response.data;

        const formattedIceServers = [
            { urls: iceServers.urls }, // STUN server unchanged
            {
                username: iceServers.username, // Use the actual username from the response
                credential: iceServers.credential, // Use the actual credential from the response
                urls: "turn:turn.cloudflare.com:3478?transport=tcp", // TURN server with TCP transport
            },
            {
                username: iceServers.username, // Same username from response
                credential: iceServers.credential, // Same credential from response
                urls: "turn:turn.cloudflare.com:3478?transport=udp", // TURN server with UDP transport
            }
        ];
        // Return the iceServers in the response
        return NextResponse.json({ formattedIceServers });

    } catch (error) {
        console.error('Error generating TURN credentials:', error.response?.data || error.message);
        return NextResponse.json({ error: error.response?.data || error.message }, { status: 500 });
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
