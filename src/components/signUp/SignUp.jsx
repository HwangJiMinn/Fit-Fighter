import React from 'react'
import { app } from "../../../firebaseconfig";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {  doc, setDoc } from 'firebase/firestore'
import { useState } from 'react';
import { Link } from "react-router-dom";
import { db } from '../../../firebaseconfig'


export default function signUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');



    // 회원가입 구현
    const submit = (e) => {
      e.preventDefault();
      if(password !== passwordConfirm) {
          alert('비밀번호가 일치하지 않습니다.');
          return;
      }
      const auth = getAuth(app);
      createUserWithEmailAndPassword(auth, email, password)
          .then(async (userCredential) => {
          const user = userCredential.user;
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, { email: user.email });
          alert("회원가입이 되었습니다.")
      })
      .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(errorMessage)
      });
  }


    return (
        <div className="flex justify-center items-center mt-20">
          <div className="w-full max-w-md">
            <div className="bg-white p-8 rounded shadow">
              <h2 className="text-2xl font-bold mb-8">회원가입</h2>
              <form onSubmit={submit}>
                <div className="mb-6">
                  <label htmlFor="username" className="block font-bold mb-2">
                    성함
                  </label>
                  <input
                    className="w-full px-4 py-2 border rounded bg-gray-100"
                    type="text"
                    id="username"
                    required
                    placeholder="이름을 입력해주세요."
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="email" className="block font-bold mb-2">
                    E-mail
                  </label>
                  <input
                    className="w-full px-4 py-2 border rounded bg-gray-100"
                    type="email"
                    id="email"
                    placeholder="이메일을 입력해주세요."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block font-bold mb-2">
                    비밀번호
                  </label>
                  <input
                    className="w-full px-4 py-2 border rounded bg-gray-100"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="비밀번호를 입력해주세요."
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="password-confirm"
                    className="block font-bold mb-2"
                  >
                    비밀번호 확인
                  </label>
                  <input
                    className="w-full px-4 py-2 border rounded bg-gray-100"
                    type="password"
                    id="password-confirm"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    placeholder="비밀번호를 입력해주세요."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded mb-4"
                >
                  회원가입
                </button>
                <Link to='/logIn'>
                <button className="w-full py-3 bg-blue-600 text-white rounded">
                    로그인 하러 가기
                </button>
                </Link>
                </form>
            </div>
            </div>
        </div>
    );
};