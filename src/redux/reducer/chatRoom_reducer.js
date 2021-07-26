import {
    SET_CURRENT_CHAT_ROOM,
    SET_PRIVATE_CHAT_ROOM,
    SET_USER_POSTS
} from '../actions/types';

const initialChatRoomState = {
    currentChatRoom: null,
    isPrivateChatRoom: false
}
// 타입에 따라서 다르게 처리해줘야함

export default function chatRoom_reducer(state = initialChatRoomState, action) {
    switch (action.type) {
        case SET_CURRENT_CHAT_ROOM:
            return {
                ...state,
                currentChatRoom: action.payload
            }
        case SET_PRIVATE_CHAT_ROOM:
            return {
                ...state,
                isPrivateChatRoom: action.payload
            }
        case SET_USER_POSTS:
            return {
                ...state,
                userPosts: action.payload
            }
        default:
            return state;
    }
}
