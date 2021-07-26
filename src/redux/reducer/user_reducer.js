import { SET_USER, CLEAR_USER, SET_PHOTO_URL } from '../actions/types';

const initialUserState = {
    currentUser: null,
    isLoading: true
}
// 타입에 따라서 다르게 처리해줘야함

export default function user_reducer(state = initialUserState, action) {
    switch (action.type) {
        case SET_USER:
            return {
                ...state,
                currentUser: action.payload,
                isLoading: false
            }
        case CLEAR_USER:
            return {
                ...state,
                currentUser: null,
                isLoading: false
            }
        case SET_PHOTO_URL:
            return {
                ...state,
                currentUser: {...state.currentUser, photoURL: action.payload},
                // 나머진 그대로 냅두고 포토URL만 바꾸면됨
                isLoading: false
            }
        default:
            return state;
    }
}
