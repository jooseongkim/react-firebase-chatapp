import React, { useEffect } from 'react';
import { Switch, Route, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

import firebase from './firebase';
import ChatPage from './components/ChatPage/ChatPage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import {setUser, clearUser} from './redux/actions/user_action';

function App(props) {
  let history = useHistory();
  let dispatch = useDispatch();
  const isLoading = useSelector(state => state.user.isLoading);

  useEffect(() => {
   firebase.auth().onAuthStateChanged(user => {
     console.log('user', user)
     if(user) {
       history.push("/"); // 로그인시 채팅페이지로 이동
       dispatch(setUser(user)) // 로그인시 유저 이름을 가져옴
     } else {
       history.push("/login"); // 비로그인시 로그인페이지로 이동
       dispatch(clearUser()) // 로그아웃시 redux에 있던 정보를 날림
     }
   })
  }, [])

  if(isLoading) {
    return (
      <div>...로딩중입니다.</div>
    )
  } else {
      return (
        <Switch>
          <Route exact path="/" component={ChatPage}/>
          <Route exact path="/login" component={LoginPage}/>
          <Route exact path="/register"component={RegisterPage}/>
        </Switch>
    );
  }
}

export default App;
