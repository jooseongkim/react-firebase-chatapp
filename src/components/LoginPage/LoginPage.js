import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import firebase from '../../firebase';


function LoginPage() {

    const { register, handleSubmit, formState: {errors} } = useForm(); //useFrom 에서 적힌 3개 가져오기
    const [errorFromSubmit, setErrorFromSubmit] = useState("")
    const [loading, setloading] = useState(false);

    const onSubmit = async (data) => {
        try {
            setloading(true)
            await firebase.auth().signInWithEmailAndPassword(data.email, data.password);
            setloading(false)
        } catch (error) {
            setErrorFromSubmit(error.message)
            setloading(false)
            setTimeout(() => {
                setErrorFromSubmit("")
            }, 5000);
        }
    }

    return (
        <div className="auth-wrapper">
            <div style= {{textAlign : 'center'}}>
                <h3>로그인</h3>                             
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>이메일</label>
                <input
                    type='email'
                    {...register('email',{ required: true, pattern: /^\S+@\S+$/i })}
                />
                {errors.email && <p>이메일을 다시 입력해주세요</p>}

                <label>비밀번호</label>
                <input
                    type="password"
                    {...register('password',{ required: true, minLength: 6 })}
                />
                {errors.password && errors.password.type === "requried" && <p>비밀번호를 입력해주세요</p>}
                {errors.password && errors.password.type === "minLength" && <p>비밓번호는 6글자 이상입니다.</p>}

                        {errorFromSubmit && <p>{errorFromSubmit}</p>}
                <input type="submit" disabled={loading}/>
                <Link style={{color:'gray', textDecoration:'none'}} to="register">회원가입</Link>
            </form>
        </div>
    )
}

export default LoginPage