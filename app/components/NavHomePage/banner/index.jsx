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
            flexDirection: "row",
            gap: width600 ? "10px" : "15px",
            justifyContent: "center",
            alignItems: "center",
            padding: width600 ? "8px" : "12px",
            width: "100%"
        }}>
            <div style={{ 
                width: width600 ? "70px" : "80px", 
                height: width600 ? "70px" : "80px", 
                border: "2px solid rgb(0, 0, 128)", 
                borderRadius: "5px", 
                padding: "5px",
                flexShrink: 0
            }}>
                <img
                    src={trainer.profile_picture ? Utils.getImageUrlOfS3(trainer.profile_picture) : "/assets/images/demoUser.png"}
                    alt="trainer_image"
                    className="rounded"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "3px",
                        transition: 'all 0.3s ease'
                    }}
                    onError={(e) => {
                        e.target.src = "/assets/images/demoUser.png";
                      }}
                />
            </div>
            <div className="card-info" style={{
                display: "flex",
                flexDirection: "column",
                gap: width600 ? "4px" : "6px",
                flex: 1,
                minWidth: 0
            }}>
                <h4 style={{
                    fontSize: width600 ? "12px" : "14px",
                    fontWeight: 600,
                    margin: 0,
                    color: "#333",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>{trainer?.fullName || trainer?.fullname}</h4>
                <h4 style={{
                    fontSize: width600 ? "11px" : "13px",
                    fontWeight: 500,
                    margin: 0,
                    color: "#666"
                }}>Price: ${trainer?.extraInfo?.hourly_rate || 0}</h4>
                <div 
                    onClick={handleTraineInstantLesson} 
                    className="instant"
                    style={{
                        marginTop: width600 ? "4px" : "6px",
                        background: "#dc3545",
                        border: "none",
                        borderRadius: "4px",
                        padding: width600 ? "6px 8px" : "8px 12px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#c82333";
                        e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#dc3545";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                >
                    <h5 style={{
                        fontSize: width600 ? "10px" : "12px",
                        fontWeight: 600,
                        margin: 0,
                        color: "white",
                        textAlign: "center",
                        letterSpacing: "0.5px"
                    }}>INSTANT LESSON</h5>
                </div>
            </div>
        </div>

    </>)
}

export default OnlineUserCard