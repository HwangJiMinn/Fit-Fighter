import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import SwiperCore, { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css';
import { db } from '../../../firebaseconfig'
import {  doc, getDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'


SwiperCore.use([Navigation, Pagination]);


export default function ExercisePage() {
  const [exercise, setExercise] = useState([])
  const [weight, setWeight] = useState(0)

  // 유저 정보 가져오기 (몸무게)
  useEffect(() => {
    const auth = getAuth();
    const loginClear = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setWeight(userData.weight);
        }
      }
    });
    return () => {
      loginClear();
    };
  }, []);
  

  // 내가 만든 데이터베이스 가져오기
  useEffect(() => {
    axios.get("../../../public/db.json").then((data) => {
      setExercise(data.data.exercise);
    });
  },[])

  const change = (e) => {
    setWeight(e.target.value)
  }

  return (
    <div className="container mx-auto p-4">
      <Swiper // swiper로 각 운동 정보 넘기기
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        className="mt-6"
      >
        {exercise.map((item) => {
          const calculateKcal = Math.round(item.kcal * weight);
          return (
            <SwiperSlide key={item.id}>
              <div className="bg-white shadow-md rounded-md p-4">
                <h3 className="text-3xl font-bold text-center mb-2">{item.name}</h3>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-contain object-center mb-4 rounded-md"
                ></img>
                <p className="font-semibold text-4xl text-center mb-4">
                  {calculateKcal} kcal
                </p>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className='font-bold text-center mt-10 text-2xl'>1시간 소모 칼로리</div>
      <div className="flex justify-center items-center mt-5">
        <label htmlFor="weight" className="font-bold mr-2">
          몸무게 (kg):
        </label>
        <input
          type="number"
          id="weight"
          value={weight}
          onChange={change}
          min="0"
          className="border-2 border-gray-300 p-1 rounded-md"
        ></input>
      </div>
    </div>
  );
}
