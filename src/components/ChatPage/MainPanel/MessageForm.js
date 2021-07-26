import React, { useState, useRef } from 'react'
import { Form } from 'react-bootstrap';
import { ProgressBar } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import firebase from '../../../firebase';
import { useSelector } from 'react-redux';
import mime from 'mime-types';


function MessageForm() {
    const chatRoom = useSelector(state => state.chatRoom.currentChatRoom)
    const user = useSelector(state => state.user.currentUser)
    const [content, setContent] = useState("")
    const [errors, setErrors] = useState([])
    const [loading, setLoading] = useState(false)
    const [percentage, setPercentage] = useState(0)
    const messagesRef = firebase.database().ref("messages")
    const inputOpenImageRef = useRef();
    const storageRef = firebase.storage().ref();
    const typingRef = firebase.database().ref("typing")
    const isPrivateChatRoom = useSelector(state => state.chatRoom.isPrivateChatRoom)

    // 키보드 입력할때마다 content 변경
    const handleChange = (event) => {
        setContent(event.target.value)
    }

    const createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: user.uid,
                name: user.displayName,
                image: user.photoURL
            }
        }
        if (fileUrl !== null) {
            message["image"] = fileUrl;
        } else {
            message["content"] = content;
        }
        return message;
    }


    const handleSubmit = async () => {
        if (!content) {
            setErrors(prev => prev.concat("내용을 입력해주세요"))
            return;
        }
        setLoading(true)
        //firebase에 메세지를 저장하는 부분
        try {
            await messagesRef.child(chatRoom.id).push().set(createMessage())

            typingRef.child(chatRoom.id).child(user.uid).remove();

            setLoading(false)
            setContent("")
            setErrors([])
        } catch (error) {
            setErrors(pre => pre.concat(error.message))
            setLoading(false)
            setTimeout(() => {
                setErrors([])
            }, 5000);
        }
    }

    const handleOpenImageRef = () => {
        inputOpenImageRef.current.click();
    }

    const getPath = () => {
        if(isPrivateChatRoom) {
            return `/message/private/${chatRoom.id}`
        } else {
            return `/message/public`
        }
    }

    const handleUploadImage = (event) => {
        const file = event.target.files[0];

        const filePath = `${getPath()}/${file.name}`;
        const metadata = { contentType: mime.lookup(file.name) }
        setLoading(true)

        try {
            // 1. 파일을 스토리지에 저장
            let uploadTask = storageRef.child(filePath).put(file, metadata)
            // async await 제거 -> 파일을 올리는 도중에 리스너가 작동을해야함
            // 2. 파일 저장되는 퍼센티지 구하기
            uploadTask.on("state_changed",
                UploadTaskSnapshot => {
                    const percentage = Math.round(
                        (UploadTaskSnapshot.bytesTransferred / UploadTaskSnapshot.totalBytes) * 100
                    )
                    setPercentage(percentage)
                },
                err => {
                    console.error(err)
                    setLoading(false)
                },
                () => {
                    // 저장이 다 된 후에 파일 메세지를 전송 (DB에 저장)
                    // 저장된 파일을 다운로드 받을 수 있는 URL가져오기
                    uploadTask.snapshot.ref.getDownloadURL()
                        .then(downloadURL => {
                            // 다운로드 확인 console.log('downloadURL', downloadURL);

                            messagesRef.child(chatRoom.id).push().set(createMessage(downloadURL))
                            setLoading(false)
                        })
                }
            )

        } catch (error) {
            alert(error)
        }
        // console.log('file', file)
    }

    const handleKeyDown = (event) => {

        // console.log('event.keyCode', event.keyCode) enter = 13, ctrl = 17
        // console.log('event.ctrlKey', event.ctrlKey) ctrl 누르면 true 나머진 false

        if(event.ctrlKey && event.keyCode === 13){
            handleSubmit();
        }

        if(content) {
            typingRef.child(chatRoom.id).child(user.uid).set(user.displayName)
        } else {
            typingRef.child(chatRoom.id).child(user.uid).remove()
        }
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Control
                        onKeyDown={handleKeyDown}
                        value={content}
                        onChange={handleChange}
                        as="textarea" 
                        rows={3} />
                </Form.Group>
            </Form>
            {
                // percentage가 0이나 100이 아닐때만 ProgresBar를 보여줌
                !(percentage === 0 || percentage === 100) &&
                <ProgressBar variant="warning" label={`${percentage}%`} animated now={percentage} />
            }

            <div>
                {errors.map(errorMsg => <p style={{ color: 'red' }} key={errorMsg}>{errorMsg}</p>)}
            </div>
            <Row>
                <Col>
                    <button
                        onClick={handleOpenImageRef}
                        className="message-form-button"
                        style={{ width: '100%' }}
                        disabled={loading ? true : false}
                    >
                        UPLOAD
                    </button>
                </Col>
                <Col>
                    <button
                        onClick={handleSubmit}
                        className="message-form-button"
                        style={{ width: '100%' }}
                        disabled={loading ? true : false}
                    >
                        SEND
                    </button>
                </Col>
            </Row>

            <input
                accept="image/jpeg, image/png, image/gif"
                style={{ display: 'none' }}
                type="file"
                ref={inputOpenImageRef}
                onChange={handleUploadImage}
            />

        </div>
    )
}

export default MessageForm
