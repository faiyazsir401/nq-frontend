import { axiosInstance } from "../../../config/axios-interceptor";


export const inviteFriend = async (payload) => {
    try {
        const response = await axiosInstance({
            method: "POST",
            url: `/user/invite-friend`,
            data: payload,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (err) {
        throw err;
    }
};



export const getRecentStudent = async () => {
    try {
        const res = await axiosInstance({
            method: "get",
            url: `/trainer/get-recent-trainees`,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const getRecentTrainers = async () => {
    try {
        const res = await axiosInstance({
            method: "get",
            url: `/trainee/recent-trainers`, // Assuming this is the endpoint
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};


export const getTraineeClips = async (payload) => {
    try {
        const res = await axiosInstance({
            method: "post",
            url: `/trainer/get-trainee-clips`,
            data: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};



