import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import firebase from '../../firebase';
import md5 from 'md5';


function RegisterPage() {

    const { register, watch, handleSubmit, formState: {errors} } = useForm(); //useFrom 에서 적힌 3개 가져오기
    const [errorFromSubmit, setErrorFromSubmit] = useState("")
    const [loding, setloding] = useState(false);

    const password = useRef();
    password.current = watch("password");

    const onSubmit = async (data) => {
        try {
            setloding(true)
            let createUser = await firebase
            .auth()
            .createUserWithEmailAndPassword(data.email, data.password)
            console.log('createUser', createUser);

            //사진과 이름 지정해주기
            await createUser.user.updateProfile({
                displayName: data.name,
                photoURL: `http://gravatar.com/avatar/${md5(createUser.user.email)}?d=identicon` //md5를 사용해서 유니크한 값을 생성
            })

            // firebase 데이터베이스에 저장해주기
            await firebase.database().ref("users").child(createUser.user.uid).set({
                name : createUser.user.displayName,
                image : createUser.user.photoURL
            })

            setloding(false)
        } catch (error) {
            setErrorFromSubmit(error.message)
            setloding(false)
            setTimeout(() => {
                setErrorFromSubmit("")
            }, 5000);
        }
    }

    return (
        <div className="auth-wrapper">
            <div style= {{textAlign : 'center'}}>
                <h3>회원가입</h3>                             
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>이메일</label>
                <input
                    type='email'
                    {...register('email',{ required: true, pattern: /^\S+@\S+$/i })}
                />
                {errors.email && <p>이메일을 다시 입력해주세요</p>}
                
                <label>이름</label>
                <input
                    {...register('name',{ required: true, maxLength: 10 })}
                />
                {errors.name && errors.name.type === "requried" && <p>이름을 입력해주세요</p>}
                {errors.name && errors.name.type === "maxLength" && <p>이름은 최대 10글자 입니다</p>}
                
                <label>비밀번호</label>
                <input
                    type="password"
                    {...register('password',{ required: true, minLength: 6 })}
                />
                {errors.password && errors.password.type === "requried" && <p>비밀번호를 입력해주세요</p>}
                {errors.password && errors.password.type === "minLength" && <p>비밓번호는 6글자 이상입니다.</p>}

                <label>비밀번호 확인</label>
                <input
                    type="password"
                    {...register('password_confirm',{ required: true, validate: (value) => value === password.current })}
                />
                    {errors.password_confirm && errors.password_confirm.type === "required" && <p>비밀번호를 입력해주세요</p>}
                    {errors.password_confirm && errors.password_confirm.type === "validate" && <p>비밀번호와 맞지 않습니다</p>}

                        {errorFromSubmit && <p>{errorFromSubmit}</p>}
                <input type="submit" disabled={loding}/>
                <Link style={{color:'gray', textDecoration:'none'}} to="login">이미 아이디가 있다면...</Link>
            </form>
        </div>
    )
}

export default RegisterPage