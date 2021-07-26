import React from 'react'
import UserPanel from './UserPanel';
import Favorited from './Favorited';
import DirectMessages from './DirectMessages';
import ChatRooms from './ChatRooms';

function SidePanel(props) {
    return (
        <div 
            style = {{
                backgroundColor : "#7B83EB",
                padding : '2rem',
                minHeight : '100%',
                color : 'white',
                minWidth : '275px'
            }}
        >
            <UserPanel />

            <Favorited />

            <ChatRooms />

            <DirectMessages />
        </div>
    )
}

export default SidePanel

//<DirectMessages currentUser = {props.currentUser}/>
