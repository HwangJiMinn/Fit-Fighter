import React from 'react'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../../firebaseconfig"
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const userprofile = useNavigate();

    const submit = (e) => {
        e.preventDefault();

        const auth = getAuth(app);
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                userprofile('/userprofile')
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(errorMessage)
            });
    }

    const googleSignIn = async () => {
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          userprofile('/userprofile');
        } catch (error) {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(errorMessage);
        }
      };

    return (
        <div className="flex justify-center items-center mt-20">
          <div className="w-full max-w-md">
            <div className="bg-white p-8 rounded shadow">
              <h2 className="text-2xl font-bold mb-8">로그인</h2>
              <form onSubmit={submit}>
                <div className="mb-6">
                  <label htmlFor="email" className="block font-bold mb-2">
                    E-mail
                  </label>
                  <input
                    className="w-full px-4 py-2 border rounded bg-gray-100"
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="이메일을 입력해주세요."
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

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded mb-4"
                >
                  로그인
                </button>

                <Link to="/signUp">
                  <button className="w-full py-3 bg-blue-600 text-white rounded">
                    회원가입 하러 가기
                  </button>
                </Link>
                <button className="w-full border flex justify-center gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150  font-medium text-sm px-5 py-2.5 text-center mt-4" onClick={googleSignIn}>
                    <img
                        className="w-6 h-6"
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        loading="lazy"
                        alt="google logo"
                    />
                    <span>Login with Google</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      );
};
