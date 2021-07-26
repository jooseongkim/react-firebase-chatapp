import React, { Component } from 'react'
import { FaStarAndCrescent } from 'react-icons/fa';
import firebase from '../../../firebase';
import { connect } from 'react-redux';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_action';

export class DirectMessages extends Component {

    state = {
        userRef: firebase.database().ref("users"),
        users : [],
        activeChatRoom: ""
    }

    componentDidMount() {
        if (this.props.user) {
            this.addUserListners(this.props.user.uid)
        }
    }

    addUserListners = (currentUserId) => {
        const { userRef } = this.state;
        let usersArray = [];
        userRef.on("child_added", DataSnapshot => {
            if (currentUserId !== DataSnapshot.key) {

                let user = DataSnapshot.val();
                // console.log("DataSnapshot.val()", DataSnapshot.val())
                user["uid"] = DataSnapshot.key;
                user["status"] = "offline";
                usersArray.push(user)
                this.setState({ users: usersArray })
            }
        })
    }

    getChatRoomId = (userId) => {
        const currentUserId = this.props.user.uid

        return userId > currentUserId
            ? `${userId}/${currentUserId}`
            : `${currentUserId}/${userId}`
    }

    changeChatRoom = (user) => {
        const chatRoomId = this.getChatRoomId(user.uid);
        const chatRoomData = {
            id : chatRoomId,
            name : user.name
        }

        this.props.dispatch(setCurrentChatRoom(chatRoomData));
        this.props.dispatch(setPrivateChatRoom(true));
        this.setActiveChatRoom(user.uid);
    }

    setActiveChatRoom = (userId) => {
        this.setState({ activeChatRoom : userId})
    }

    renderDirectMessages = users => 
        users.length > 0 && users.map(user => (
          <li 
            key={user.uid} 
            style={{
                backgroundColor : user.uid === this.state.activeChatRoom && "#FFFFFF46"
            }}
            onClick={() => this.changeChatRoom(user)}>
                # {user.name}
          </li> 
        ))

    render() {
        const { users } = this.state;
        return (
            <div>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    <FaStarAndCrescent style={{ marginRight: '3px' }} />  DIRECT MESSAGES(1)
                </span>

                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {this.renderDirectMessages(users)}
                </ul>
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        user: state.user.currentUser
    }
}

export default connect(mapStateToProps)(DirectMessages)
