import React, { Component } from 'react'
import { FaRocket } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { connect } from 'react-redux';
import firebase from '../../../firebase';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_action';
import Badge from 'react-bootstrap/Badge';

export class ChatRooms extends Component {

    state = {
        show : false,
        name : "",
        description : "",
        chatRoomsRef : firebase.database().ref("chatRooms"),
        chatRooms: [],
        messagesRef: firebase.database().ref("messages"),
        firstLoad: true,
        activeChatRoomId: "",
        notifications: []
    }

    componentDidMount(){
        this.AddChatRoomsListeners();
    }

    componentWillUnmount() {
        this.state.chatRoomsRef.off();

        this.state.chatRooms.forEach(chatRoom => {
            this.state.messagesRef.child(chatRoom.id).off();
        })
    }

    setFirstChatRoom = () => {
        const firstChatRoom = this.state.chatRooms[0]
        if(this.state.firstLoad && this.state.chatRooms.length > 0){
            this.props.dispatch(setCurrentChatRoom(firstChatRoom))
            this.setState({ activeChatRoomId : firstChatRoom.id })
        }   
        this.setState({ firstLoad : false })
    }

    AddChatRoomsListeners = () => {
        let chatRoomsArray = [];

        // 차일드가 추가되었을 경우 리스너가 작동 방금 생성한 채팅방을 띄워줍니다.
        this.state.chatRoomsRef.on("child_added", DataSnapshot =>{
            chatRoomsArray.push(DataSnapshot.val());
            // 들어오면 첫번째 방이 로드가 됩니다.
            this.setState({ chatRooms: chatRoomsArray}, () => this.setFirstChatRoom());
            // firebase의 실시간 통신을 사용

            this.addNotificationListner(DataSnapshot.key);
        })
    }

    addNotificationListner = (chatRoomId) => {
        this.state.messagesRef.child(chatRoomId).on("value", DataSnapshot => {
            if(this.props.chatRoom) {

                // console.log("DataSnapshot", DataSnapshot)

                this.handleNotification(
                    chatRoomId,
                    this.props.chatRoom.id,
                    this.state.notifications,
                    DataSnapshot
                )
            }
        })
    }

    // 방에 맞는 알림 정보를 Notifications state에 넣어주기
    handleNotification = (chatRoomId, currentChatRoomId, notifications, DataSnapshot) => {

        let lastTotal = 0;

        // 이미 notifications state 안에 알림 정보가 들어있는 채팅방과 그렇지 않은 채팅방을 나눠줌
        let index = notifications.findIndex(notification => 
            notification.id === chatRoomId )

            // notifications state 안에 해당 채팅방의 알림 정보가 없을 때
            if(index === -1) {
                notifications.push({
                    id: chatRoomId,
                    total : DataSnapshot.numChildren(),
                    lastKnownTotal : DataSnapshot.numChildren(),
                    count : 0
                    /* id: chatRoomId,   //채팅방 아이디
                    total : DataSnapshot.numChildren(),  //해당 채팅방 전체 메시지 개수
                    lastKnownTotal : DataSnapshot.numChildren(), // 이전에 확인한 전체 메시지 개수
                    count : 0 //알림으로 사용할 숫자 */
                    // DataSnapshot.numChildren() 전체 Children 개수, 전체 메시지 개수
                })
            } 
            // 이미 해당 채팅방의 알림 정보가 있을 때
            else {
                // 상대방이 채팅 보내는 그 해당 채팅방에 있지 않을 시
                if (chatRoomId !== currentChatRoomId) {
                    // 현재까지 유저가 확인한 총 메시지 개수
                    lastTotal = notifications[index].lastKnownTotal;

                    // count (알림으로 보여줄 숫자) 구하기
                    // 현재 총 메시지 개수 - 이전에 확인한 총 메시지 개수 > 0
                    // 현재 총 메시지 개수가 10개이고 이전에 확인한 게 8개였다면 2개를 알림으로 보여줘야 함
                    if (DataSnapshot.numChildren() - lastTotal > 0) {
                        notifications[index].count = DataSnapshot.numChildren() - lastTotal;
                    }
                }

                // total property에 현재 전체 메시지 개수를 넣어주기
                notifications[index].total = DataSnapshot.numChildren();
            }
        this.setState({ notifications });

    }

    handleClose = () => this.setState({ show: false });
    handleShow = () => this.setState({ show: true });
    handleSubmit = (e) => {
        e.preventDefault();

        const { name, description } = this.state;

        if(this.isFormValid(name, description)) {
            this.addChatRoom();
        }
    }
    addChatRoom = async () => {

        const key = this.state.chatRoomsRef.push().key;
        const {name, description} = this.state;
        const {user} = this.props;
        const newChatRoom = {
            id: key,
            name: name,
            description: description,
            createBy : {
                name: user.displayName,
                image : user.photoURL
            }
        }

        try {
            await this.state.chatRoomsRef.child(key).update(newChatRoom)
            this.setState({
                name:"",
                description: "",
                show : false
            })
        } catch (error) {
            alert(error)
        }
    }

    isFormValid = (name, description) =>
        name && description;

    getNotificationCount = (room) => {
        // 해당 채팅방의 count 구하기
        let count = 0;

        this.state.notifications.forEach(notification => {
            if (notification.id === room.id) {
                count = notification.count;
            }
        })
        if(count > 0) return count;
    }

    renderChatRooms = (chatRooms) =>
    chatRooms.length > 0 &&
    chatRooms.map(room => (
        <li
            key={room.id}
            style= {{ backgroundColor: room.id === this.state.activeChatRoomId && "#ffffff45"}}
            onClick={() => this.changeChatRoom(room)}
        >
            # {room.name}
            <Badge variant="danger" style={{ float: 'right', marginTop: '4px'}}>
                {this.getNotificationCount(room)}
            </Badge>
        </li>
    ))
    changeChatRoom = (room) => {
        this.props.dispatch(setCurrentChatRoom(room));
        this.props.dispatch(setPrivateChatRoom(false));
        this.setState({ activeChatRoomId: room.id })
        this.clearNotifications();
    }
    clearNotifications = () => {
        let index = this.state.notifications.findIndex(
            notification => notification.id === this.props.chatRoom.id
        )

        if(index !== -1) {
            let updatedNotification = [...this.state.notifications];
            updatedNotification[index].lastKnownTotal = this.state.notifications[index].total;
            updatedNotification[index].count = 0;
            this.setState({ notifications : updatedNotification });
        }
    }

    render() {
        return (
            <div>
                <div style={{
                    position: 'relative', width: '100%',
                    display: 'flex', alignItems: 'center'
                }}>
                    <FaRocket style={{ marginRight: 3 }} />
                    CHAT ROOMS {" "}

                    <FaPlus
                        onClick={this.handleShow}
                        style={{
                            position: 'absolute',
                            right: 0, cursor: 'pointer'
                        }} />
                </div>

                {/* 채팅방 데이터 렌더링 */}
                <ul style={{ listStyleType: 'none', padding: 0 }} >
                    {this.renderChatRooms(this.state.chatRooms)}
                </ul>


                {/* 채팅 Modal 창 생성 */}
                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header >
                        <Modal.Title>채팅방 생성</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>채팅방 이름</Form.Label>
                                <Form.Control 
                                onChange={(e) => this.setState({name: e.target.value})}
                                type="text" 
                                placeholder="Enter a chat room name" />
                            </Form.Group>
                            <br/>
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>채팅방 설명</Form.Label>
                                <Form.Control 
                                onChange={(e) => this.setState({description: e.target.value})}
                                type="text" 
                                placeholder="Enter a chat room description" />
                            </Form.Group>

                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={this.handleSubmit}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}
// state에 들어있는 내용을 컴포넌트 안에서 props로 변환해서 사용
const mapStateToProps = state => {
    return{
        user: state.user.currentUser,
        chatRoom : state.chatRoom.currentChatRoom
    }
}

export default connect(mapStateToProps)(ChatRooms) 
