import React, { useEffect, useState } from 'react'
import SelectClips from '../bookings/start/SelectClips';
import { useAppDispatch } from '../../store';
import { addTraineeClipInBookedSessionAsync } from '../common/common.slice';
import { myClips, shareClips } from '../../../containers/rightSidebar/fileSection.api';
import { toast } from "react-toastify";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ShareClipsCard = () => {
  const dispatch = useAppDispatch()
  const [clips, setClips] = useState([]);
  const [err, setErr] = useState({ email: false, video: false });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClips, setSelectedClips] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const handleSelectClip = () => {
    if (!emailRegex.test(userEmail)) setErr({ email: true, video: false })
    else {
      setErr({ email: false, video: false })
      setIsModalOpen(true)
    };

  };
  const closeModal = () => {
    setIsModalOpen(false);
    setUserEmail("")
    setSelectedClips([])
  };
  const addTraineeClipInBookedSession = async () => {
    const payload = { id: isOpenID, trainee_clip: selectedClips?.map(val => val?._id) };
    dispatch(addTraineeClipInBookedSessionAsync(payload));
    dispatch(removeNewBookingData());
    setIsOpen(false)
    setIsModalOpen(false);
  }

  const onShare = async () => {
    if (!emailRegex.test(userEmail)) setErr({ email: true, video: false });
    else
      if (!selectedClips?.length) setErr({ email: false, video: true });
      else {
        var res = await shareClips({ user_email: userEmail, clips: selectedClips })
        toast?.success("Email sent successfully.", { type: "success" })
        setErr({ email: false, video: false })
        setIsModalOpen(false)
        setUserEmail("")
        setSelectedClips([])
      }
  }

  const getmyClips = async () => {
    var res = await myClips({})
    setClips(res?.data)
  }


  useEffect(() => {
    getmyClips()
  }, [])

  return (
    <div style={{ margin: "auto" }}>
      <div className="row" style={{ justifyContent: "center" }}>
        <h3 className="mt-3">Share Clips</h3>
      </div>
      <div className="row" style={{ justifyContent: "center", paddingTop: "10px", margin: "auto" }}>
        <input value={userEmail} onChange={(e) => setUserEmail(e?.target?.value)} className="form-control" type="email" placeholder="Email"></input>
      </div>

      {err?.video && <p style={{ color: "red", marginTop: "5px" }}>Please select video.</p>}
      {err?.email && <p style={{ color: "red", marginTop: "5px" }}>Invalid Email.</p>}

      <div className="row" style={{ justifyContent: "center", marginTop: "10px" }}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleSelectClip}
        >
          Select Clip
        </button>
      </div>

      {isModalOpen && (
        <SelectClips
          isOpen={isModalOpen}
          onClose={closeModal}
          selectedClips={selectedClips}
          clips={clips}
          addTraineeClipInBookedSession={addTraineeClipInBookedSession}
          setSelectedClips={setSelectedClips}
          onShare={onShare}
        />
      )}

    </div>
  )
}

export default ShareClipsCard