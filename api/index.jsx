import axios from "axios";

export const fetchChatMemberApi = () => {
    console.trace('[API AUDIT] fetchChatMemberApi called from:');
    return axios.get(`/api/chatMember.json`);
};

export const fetchChatApi = () => {
    console.trace('[API AUDIT] fetchChatApi called from:');
    return axios.get(`/api/chat.chats.json`);
};

export const fetchPeerConfig = () =>{
    return axios.get(`/api/peer`)
}