import { Utils } from "../../../../utils/utils";
import { topNavbarOptions } from "../../../common/constants";
import { useAppDispatch } from "../../../store";
import { authAction } from "../../auth/auth.slice";

const OnlineUserCard = ({ trainer }) => {
    const dispatch = useAppDispatch();

    const handleTraineInstantLesson = () => {
        dispatch(authAction?.setSeletedOnlineTrainer({
            tab: topNavbarOptions?.BOOK_LESSON,
            selectedOnlineUser: trainer
        }))
    }

    return (<>
        <div className="trainer-card">
            <div style={{ width: "80px", height: "80px", border: "2px solid rgb(0, 0, 128)", borderRadius: "5px", padding: "5px" }}>
                <img
                    src={trainer.profile_picture ? Utils.getImageUrlOfS3(trainer.profile_picture) : "/assets/images/demoUser.png"}
                    alt="trainer_image"
                    className="rounded"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: "50%",
                        transition: 'all 0.6s linear'
                    }}
                    onError={(e) => {
                        e.target.src = "/assets/images/demoUser.png";
                      }}
                />
            </div>
            <div className="card-info">
                <h4>Name: {trainer?.fullname}</h4>
                <h4>Price: ${trainer?.extraInfo?.hourly_rate}</h4>
                <div onClick={handleTraineInstantLesson} className="instant">
                    <h5 >INSTANT LESSON</h5>
                </div>
            </div>
        </div>

    </>)
}

export default OnlineUserCard