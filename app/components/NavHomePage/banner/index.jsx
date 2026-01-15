import { Utils } from "../../../../utils/utils";
import { topNavbarOptions } from "../../../common/constants";
import { useAppDispatch } from "../../../store";
import { authAction } from "../../auth/auth.slice";
import { useMediaQuery } from "../../../hook/useMediaQuery";

const OnlineUserCard = ({ trainer }) => {
    const dispatch = useAppDispatch();
    const width600 = useMediaQuery(600);

    const handleTraineInstantLesson = () => {
        dispatch(authAction?.setSeletedOnlineTrainer({
            tab: topNavbarOptions?.BOOK_LESSON,
            selectedOnlineUser: trainer
        }))
    }

    return (<>
        <div className="trainer-card" style={{
            display: "flex",
            flexDirection: "column",
            gap: width600 ? "10px" : "12px",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: width600 ? "14px 10px" : "18px 16px",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            height: "auto",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            minHeight: "auto",
            touchAction: "manipulation"
        }}>
            <div style={{ 
                width: width600 ? "90px" : "110px", 
                height: width600 ? "90px" : "110px", 
                border: width600 ? "3px solid rgb(0, 0, 128)" : "4px solid rgb(0, 0, 128)", 
                borderRadius: "50%", 
                padding: "0",
                flexShrink: 0,
                boxSizing: "border-box",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                marginBottom: width600 ? "6px" : "8px",
                position: "relative"
            }}>
                <img
                    src={trainer.profile_picture ? Utils.getImageUrlOfS3(trainer.profile_picture) : "/assets/images/demoUser.png"}
                    alt="trainer_image"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        borderRadius: "50%",
                        transition: 'all 0.3s ease',
                        display: "block",
                        margin: "0",
                        padding: "0"
                    }}
                    onError={(e) => {
                        e.target.src = "/assets/images/demoUser.png";
                      }}
                />
            </div>
            <div className="card-info" style={{
                display: "flex",
                flexDirection: "column",
                gap: width600 ? "6px" : "8px",
                width: "100%",
                alignItems: "center",
                textAlign: "center",
                padding: "0",
                flex: "1",
                justifyContent: "flex-start"
            }}>
                <h4 style={{
                    fontSize: width600 ? "14px" : "16px",
                    fontWeight: 600,
                    margin: 0,
                    padding: "0 4px",
                    color: "#333",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                    textAlign: "center",
                    lineHeight: "1.3"
                }}>{trainer?.fullName || trainer?.fullname}</h4>
                <h4 style={{
                    fontSize: width600 ? "12px" : "14px",
                    fontWeight: 500,
                    margin: 0,
                    padding: "0 4px",
                    color: "#666",
                    textAlign: "center",
                    lineHeight: "1.3"
                }}>Price: ${trainer?.extraInfo?.hourly_rate || 0}</h4>
                <div 
                    onClick={handleTraineInstantLesson} 
                    className="instant"
                    style={{
                        marginTop: width600 ? "8px" : "10px",
                        background: "#ff6b6b",
                        border: "none",
                        borderRadius: "6px",
                        padding: width600 ? "10px 12px" : "12px 16px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 6px rgba(255, 107, 107, 0.4)",
                        width: "100%",
                        maxWidth: "100%",
                        touchAction: "manipulation",
                        minHeight: width600 ? "40px" : "44px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ff5252";
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(255, 107, 107, 0.6)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ff6b6b";
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 2px 6px rgba(255, 107, 107, 0.4)";
                    }}
                    onTouchStart={(e) => {
                        e.currentTarget.style.background = "#ff5252";
                        e.currentTarget.style.transform = "scale(0.98)";
                    }}
                    onTouchEnd={(e) => {
                        e.currentTarget.style.background = "#ff6b6b";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                >
                    <h5 style={{
                        fontSize: width600 ? "13px" : "15px",
                        fontWeight: 700,
                        margin: 0,
                        color: "#ffffff",
                        textAlign: "center",
                        letterSpacing: "0.8px",
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                        lineHeight: "1.2"
                    }}>INSTANT LESSON</h5>
                </div>
            </div>
        </div>

    </>)
}

export default OnlineUserCard