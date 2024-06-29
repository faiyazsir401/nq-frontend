import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { inviteFriend } from '../NavHomePage/navHomePage.api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const InviteFriendsCard = () => {
    const [err, setErr] = useState({ email: false, video: false });
    const [userEmail, setUserEmail] = useState("");
    const sendInvitiation = async () => {
        if (!emailRegex.test(userEmail)) setErr({ email: true, video: false })
        else {
            var res = await inviteFriend({ user_email: userEmail })
            toast?.success("Email sent successfully.", { type: "success" })
            setErr({ email: false, video: false })
            setUserEmail("")
        }
    }
    return (
        <div>
            <div className='Inv-freind'>
                <h3>Invite a Friend</h3>
            </div>
            <div className='Invite-freind'>
                {/* Placeholder */}
                <input className='form-control' type="text" placeholder="Enter friend's email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                {err?.email && <p style={{ color: "red", marginTop: "5px", textAlign: "left", width: "100%" }}>Invalid Email.</p>}
                {/* Buttons */}
                <div className='Button-up'>
                    <button className='btn btn-primary btn-sm btn_css' type="button" onClick={sendInvitiation}>Invite Friend</button>
                </div>
            </div>
        </div>
    );
}

export default InviteFriendsCard;
