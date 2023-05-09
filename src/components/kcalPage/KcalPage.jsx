import React, { useState, useEffect } from 'react';
import useAuth from '../../useAuth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function KcalPage() {
  const { isLoggedIn, user } = useAuth();
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('low');
  const [kcal, setKcal] = useState(null);
  const [recommendedKcal, setRecommendedKcal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isLoggedIn && user) {
        const firestore = getFirestore();
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
  
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setAge(userData.age);
          setHeight(userData.height);
          setWeight(userData.weight);
          setGender(userData.gender)
        }
      }
    };
  
    fetchData();
  }, [isLoggedIn, user]);



  const calculateKcal = () => {
    let baseKcal = 0;

    if (gender === 'male') {
      baseKcal = 66.47 + (13.75 * weight) + (5 * height) - (6.76 * age);
    } else {
      baseKcal = 655.1 + (9.56 * weight) + (1.85 * height) - (4.68 * age);
    }

    setKcal(Math.round(baseKcal));

    const activity = {
      high: 40,
      medium: 32.5,
      low: 25,
    };


    const idealWeight = (height - 100) * 0.9;
    const dailyRecommendedKcal = idealWeight * activity[activityLevel];

    setRecommendedKcal(Math.round(dailyRecommendedKcal));
  };

  return (
    <div className="container mx-auto mt-20" >
      <h1 className="text-3xl font-bold mb-10 text-center">칼로리 계산</h1>
      <div className="flex items-center justify-center">
        <div className="input-container bg-gray-100 p-6 rounded-lg mr-5 flex-1">
          <label htmlFor="gender" className="block mb-2">
            성별:
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full mb-4 p-2 rounded-md"
          >
            <option value="">선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>

          <label htmlFor="age" className="block mb-2">
            나이:
          </label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full mb-4 p-2 rounded-md"
          />

          <label htmlFor="height" className="block mb-2">
            키 (cm):
          </label>
          <input
            type="number"
            id="height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full mb-4 p-2 rounded-md"
          />

          <label htmlFor="weight" className="block mb-2">
            몸무게 (kg):
          </label>
          <input
          type="number"
          id="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full mb-4 p-2 rounded-md"
          />

          <label htmlFor="activityLevel" className="block mb-2">
            활동 지수:
          </label>
          <select
            id="activityLevel"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            className="w-full mb-4 p-2 rounded-md"
          >
            <option value="high">활동량이 높은 경우</option>
            <option value="medium">활동량이 보통인 경우</option>
            <option value="low">활동량이 적은 경우</option>
          </select>

          <button
            onClick={calculateKcal}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            계산하기
          </button>
        </div>
        <div className="kcal-result flex-1 ">
          <div className="bg-green-200 p-4 rounded-lg">
            {kcal && (
              <p className='text-2xl pb-10'>
                당신의 기초 대사량은:{" "}<br/>
                <strong className="text-green-900 text-5xl">{kcal} 칼로리</strong>
              </p>
            )}
            {recommendedKcal && (
              <p className='text-2xl'>
                당신의 하루 권장 칼로리량은:{" "}<br/>
                <strong className="text-green-900 text-5xl">{recommendedKcal} 칼로리</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}