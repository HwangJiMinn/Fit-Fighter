import React from 'react'
import { useState, useEffect } from 'react'
import { db } from '../../../firebaseconfig'
import {  doc, setDoc, getDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [userId, setUserId] = useState('')


  useEffect(() => {
    const auth = getAuth();
    const loginClear = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDocRef = doc(db, 'users', user.uid)
        const userDocSnap = await getDoc(userDocRef)
        
        if(userDocSnap.exists){
          const userData = userDocSnap.data();
          setEmail(user.email)
          setName(userData.name)
          setGender(userData.gender)
          setAge(userData.age)
          setHeight(userData.height)
          setWeight(userData.weight)
        }
      }
    })

    return () => {
      loginClear();
    }
  }, [])

  const submit = async (e) => {
    e.preventDefault();
    if(!userId) return;

    const userDocRef = doc(db, 'users', userId)
    await setDoc(userDocRef, {
      email,
      name,
      gender,
      age,
      height,
      weight,
    });
    alert("저장 되었습니다.")
  };

  const navigate = useNavigate();
  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      alert("로그아웃 되었습니다.")
      navigate("/");
    } catch (error) {
      console.error("로그아웃 중 에러 발생:", error);
    }
  };

  return (
    <div className="container mx-auto mt-20 max-w-md">
      <div className="text-2xl font-bold mb-6">나의 정보</div>
      <form onSubmit={submit}>
        <div className="mb-4">
          <label htmlFor='email' className="block mb-1 font-bold">Email</label>
          <input type='email' id='email' value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded"></input>
        </div>
        <div className="mb-4">
          <label htmlFor='name' className="block mb-1 font-bold">닉네임</label>
          <input type='text' id='name' value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded"></input>
        </div>
        <div className="mb-4">
          <label htmlFor='gender' className="block mb-1 font-bold">성별</label>
          <select id='gender' value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
            <option value="">선택</option>
            <option value="male">남자</option>
            <option value="female">여자</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor='age' className="block mb-1 font-bold">나이</label>
          <input type='number' id='age' value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-2 border border-gray-300 rounded"></input>
        </div>
        <div className="mb-4">
          <label htmlFor='height' className="block mb-1 font-bold">키</label>
          <input type='number' id='height' value={height} onChange={(e) => setHeight(e.target.value)} className="w-full p-2 border border-gray-300 rounded"></input>
        </div>
        <div className="mb-4">
          <label htmlFor='weight' className="block mb-1 font-bold">몸무게</label>
          <input type='number' id='weight' value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2 border border-gray-300 rounded"></input>
        </div>
        <button type='submit' className="w-full p-2 bg-blue-500 text-white font-bold rounded">저장</button>
        <button onClick={logout} className="w-full p-2 mt-4 bg-red-500 text-white font-bold rounded">로그아웃</button>
      </form>
    </div>
  )
}

