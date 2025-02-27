import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { inviteFriend } from '../NavHomePage/navHomePage.api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InviteFriendsCard = () => {
    const [err, setErr] = useState("");
    const [userEmails, setUserEmails] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const emails = text.split(/\r?\n|,/).map(email => email.trim()).filter(email => emailRegex.test(email));
                setUserEmails(prev => prev ? `${prev}, ${emails.join(', ')}` : emails.join(', '));
            };
            reader.readAsText(file);
        }
    };

    const sendInvitation = async () => {
        setLoading(true);
        setErr("");
        let emailList = userEmails.split(',').map(email => email.trim()).filter(email => emailRegex.test(email));
        
        if (emailList.length === 0) {
            setErr("Invalid email(s) found.");
            setLoading(false);
            return;
        }

        if (emailList.length > 10) {
            setErr("You can invite a maximum of 10 friends at a time.");
            setLoading(false);
            return;
        }

        let failedEmails = [];
        await Promise.all(emailList.map(async (email) => {
            try {
                await inviteFriend({ user_email: email });
            } catch (error) {
                failedEmails.push(email);
            }
        }));
        
        if (failedEmails.length) {
            toast.error(`Failed to send invitations to: ${failedEmails.join(', ')}`);
            setErr(`Failed to send invitations to: ${failedEmails.join(', ')}`);
        } else {
            toast.success("Emails sent successfully.");
            setUserEmails("");
        }
        setLoading(false);
    };

    return (
        <div className="invite-card-container">
            <div className='invite-header mb-2 text-center'>
                <h3>Invite Friends</h3>
            </div>
            <div className='invite-body'>
                <textarea
                    className='form-control mb-2'
                    placeholder="Enter friend's emails separated by commas"
                    value={userEmails}
                    onChange={(e) => setUserEmails(e.target.value)}
                />
                {err && <p className='error-message'>{err}</p>}
                
                <input type="file" accept=".csv" className='file-upload mb-2 ' onChange={handleFileUpload} />
                
                <div className='button-container text-center'>
                    <button className='btn btn-primary' type="button" onClick={sendInvitation} disabled={loading}>
                        {loading ? "Sending..." : "Invite Friends"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InviteFriendsCard;