import React, { useRef } from 'react'
import { IoIosChatboxes } from 'react-icons/io';
import Dropdown from 'react-bootstrap/Dropdown';
import Image from 'react-bootstrap/Image';
import { useSelector, useDispatch } from 'react-redux';
import firebase from '../../../firebase';
import mime from 'mime-types';
import { setPhotoURL } from '../../../redux/actions/user_action';

function UserPanel() {
    const user = useSelector(state => state.user.currentUser);
    const InputOpenImageRef = useRef();
    const dispatch = useDispatch();

    const handleLogout = () => {
        firebase.auth().signOut();
    }

    const handleOpenImageRef = () => {
        InputOpenImageRef.current.click();
    }

    const handleUploadImage = async (event) => {
        const file = event.target.files[0];

        console.log(file, 'file');

        if (!file) return;
        /* 메타데이터를 구하기 위해 밈 타입을 사용함 */
        const metadata = { contentType: mime.lookup(file.name) };
        /* 밈타입 사용 npm install mime-types --save  */
        try {
            /* firebase storage에 파일을 업로드 */
            let uploadTaskSnapshot = await firebase.storage().ref()
                .child(`user_image/${user.uid}`)
                .put(file, metadata)

            // 업로드한 URL 가져오기
            let downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();

            // 프로필 이미지 수정
            await firebase.auth().currentUser.updateProfile({
                photoURL : downloadURL
            })
            /* 확인용 console.log */
            console.log('uploadTaskSnapshot', uploadTaskSnapshot);

            // 이미지 변경
            dispatch(setPhotoURL(downloadURL))
            
            // 데이터베이스 유저 이미지 수정
            await firebase.database().ref("users")
                .child(user.uid)
                .update({ image : downloadURL})
        } catch (error) {
            alert(error)
        }
    }

    return (
        <div>
            {/* 로고 화면(사이드) */}
            <h3 style={{ color: 'white' }}>
                <IoIosChatboxes />{" "} Chat App
            </h3>

            <div style={{ display: 'flex', marginBottom: '1rem' }}>
                <Image src={user && user.photoURL}
                    style={{ width: '30p', height: '30px', marginTop: '3px' }}
                    roundedCircle />
                <Dropdown>
                    <Dropdown.Toggle
                        style={{ background: 'transparent', border: '0px' }}
                        id="dropdown-basic">
                        {user && user.displayName}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleOpenImageRef}>
                            프로필 사진 변경
                        </Dropdown.Item>

                        <Dropdown.Item onClick={handleLogout}>
                            로그아웃
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <input
                onChange={handleUploadImage}
                type="file"
                accept="image/jpeg, image/png, image/gif"
                ref={InputOpenImageRef}
                style={{ display: 'none' }}
            />
        </div>
    )
}

export default UserPanel
