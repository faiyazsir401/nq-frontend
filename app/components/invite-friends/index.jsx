import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { inviteFriend } from '../NavHomePage/navHomePage.api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InviteFriendsCard = () => {
  const [err, setErr] = useState("");
  const [userEmails, setUserEmails] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedEmails = userEmails
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email);

  const validEmails = parsedEmails.filter((email) => emailRegex.test(email));
  const invalidEmails = parsedEmails.filter(
    (email) => email && !emailRegex.test(email)
  );


  const sendInvitation = async () => {
    setLoading(true);
    setErr("");

    const emailList = validEmails;

    if (emailList.length === 0) {
      setErr("Please enter at least one valid email address.");
      setLoading(false);
      return;
    }

    if (emailList.length > 10) {
      setErr("You can invite a maximum of 10 friends at a time.");
      setLoading(false);
      return;
    }

    let failedEmails = [];
    await Promise.all(
      emailList.map(async (email) => {
        try {
          await inviteFriend({ user_email: email.toLowerCase() });
        } catch (error) {
          failedEmails.push(email);
        }
      })
    );

    if (failedEmails.length) {
      toast.error(
        `Failed to send invitations to: ${failedEmails.join(", ")}`
      );
      setErr(`Failed to send invitations to: ${failedEmails.join(", ")}`);
    } else {
      toast.success("Invitations sent successfully.");
      setUserEmails("");
    }
    setLoading(false);
  };

  return (
    <div
      className="invite-card-container"
      style={{
        padding: "16px",
        borderRadius: "10px",
        border: "1px solid #e0e0e0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        background: "#ffffff",
      }}
    >
      <div className="invite-header mb-3 text-center">
        <h3 style={{ marginBottom: "4px", fontWeight: 600, color: "#000080" }}>
          Invite Friends
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#666",
          }}
        >
          Share NetQwix with your friends. Enter up to 10 email addresses.
        </p>
      </div>

      <div className="invite-body">
        <label
          style={{
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "6px",
            display: "block",
            color: "#333",
          }}
        >
          Email addresses
        </label>
        <textarea
          className="form-control mb-2"
          rows={3}
          placeholder="Type or paste emails separated by commas (e.g. john@example.com, jane@example.com)"
          value={userEmails}
          onChange={(e) => setUserEmails(e.target.value)}
          style={{ fontSize: "13px" }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            marginBottom: "8px",
            color: "#555",
            flexWrap: "wrap",
            gap: "4px",
          }}
        >
          <span>
            {validEmails.length} valid email
            {validEmails.length === 1 ? "" : "s"}
            {parsedEmails.length > 0 && ` • ${parsedEmails.length} total`}
          </span>
          <span style={{ color: "#999" }}>Max 10 invites per send</span>
        </div>

        {invalidEmails.length > 0 && (
          <div
            style={{
              background: "#fff4e5",
              borderRadius: "6px",
              padding: "6px 8px",
              marginBottom: "8px",
              fontSize: "12px",
              color: "#b26a00",
            }}
          >
            Some emails don&apos;t look right and will be ignored:
            <br />
            <span style={{ fontWeight: 500 }}>
              {invalidEmails.join(", ")}
            </span>
          </div>
        )}

        {err && (
          <p
            className="error-message"
            style={{ color: "#d32f2f", fontSize: "12px", marginBottom: "8px" }}
          >
            {err}
          </p>
        )}

        <div className="button-container text-center">
          <button
            className="btn btn-primary"
            type="button"
            onClick={sendInvitation}
            disabled={loading || validEmails.length === 0}
            style={{
              minWidth: "160px",
              fontWeight: 600,
              borderRadius: "20px",
            }}
          >
            {loading ? "Sending..." : "Send Invites"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsCard;