import { axiosInstance } from "../../../config/axios-interceptor";


export const inviteFriend = async (payload) => {
    try {
        const response = await axiosInstance({
            method: "POST",
            url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/invite-friend`,
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
            url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/trainer/get-recent-trainees`,
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
            url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/trainer/get-trainee-clips`,
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



