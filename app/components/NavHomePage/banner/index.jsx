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
            gap: width600 ? "8px" : "12px",
            justifyContent: "center",
            alignItems: "center",
            padding: width600 ? "6px 8px" : "10px 12px",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            height: "100%"
        }}>
            <div style={{ 
                width: width600 ? "60px" : "70px", 
                height: width600 ? "60px" : "70px", 
                border: "2px solid rgb(0, 0, 128)", 
                borderRadius: "5px", 
                padding: "4px",
                flexShrink: 0,
                boxSizing: "border-box",
                backgroundColor: "#fff"
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
                        transition: 'all 0.3s ease',
                        display: "block"
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
                minWidth: 0,
                maxWidth: "calc(100% - 80px)",
                overflow: "hidden"
            }}>
                <h4 style={{
                    fontSize: width600 ? "12px" : "13px",
                    fontWeight: 600,
                    margin: 0,
                    color: "#333",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>{trainer?.fullName || trainer?.fullname}</h4>
                <h4 style={{
                    fontSize: width600 ? "11px" : "12px",
                    fontWeight: 500,
                    margin: 0,
                    color: "#666"
                }}>Price: ${trainer?.extraInfo?.hourly_rate || 0}</h4>
                <div 
                    onClick={handleTraineInstantLesson} 
                    className="instant"
                    style={{
                        marginTop: width600 ? "4px" : "6px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: "4px",
                        padding: width600 ? "6px 8px" : "8px 12px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 6px rgba(102, 126, 234, 0.4)"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)";
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(102, 126, 234, 0.6)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 2px 6px rgba(102, 126, 234, 0.4)";
                    }}
                >
                    <h5 style={{
                        fontSize: width600 ? "10px" : "12px",
                        fontWeight: 700,
                        margin: 0,
                        color: "#ffffff",
                        textAlign: "center",
                        letterSpacing: "0.8px",
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)"
                    }}>INSTANT LESSON</h5>
                </div>
            </div>
        </div>

    </>)
}

export default OnlineUserCard