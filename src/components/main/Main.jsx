import React from "react";
import { Carousel } from "react-responsive-carousel"; //리액트 캐러셀 사용
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from "react-router-dom";
import useAuth from "../../useAuth";

export default function Main() {
  const { isLoggedIn } = useAuth(); //커스텀 훅 사용
  const CommunityPermission = isLoggedIn ? "/Community" : "/login"; //비로그인 시 로그인 페이지로 이동

  return (
    <div className="mt-20">
      <Carousel showThumbs={false} className="relative">
        <div className="relative h-[500px]">
            <img src="/칼로리 계산기.jpg" alt="Kcalcalculator" className="h-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
              <p className="text-4xl text-white">당신의 기초대사량과 하루 권장 칼로리를 계산해보세요!</p>
              <Link to="/kcalPage" className="mt-4 px-8 py-2 text-2xl text-white bg-blue-500 rounded-full">바로가기</Link>
            </div>
        </div>
        <div className="relative h-[500px]">
            <img src="/음식.jpg" alt="food" className="h-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
              <p className="text-4xl text-white">음식의 성분을 검색해보세요!</p>
              <Link to="/food" className="mt-4 px-8 py-2 text-2xl text-white bg-blue-500 rounded-full">바로가기</Link>
            </div>
        </div>
        <div className="relative h-[500px]">
            <img src="/운동.jpg" alt="exercise" className="h-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
              <p className="text-4xl text-white">운동 정보를 알아보세요!</p>
              <Link to="/excercisePage" className="mt-4 px-8 py-2 text-2xl text-white bg-blue-500 rounded-full">바로가기</Link>
            </div>
        </div>
        <div className="relative h-[500px]">
            <img src="/커뮤니티.jpg" alt="community" className="h-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
              <p className="text-4xl text-white">소통을 통해 더욱 재밌게 운동을 즐겨봐요!</p>
              <Link to={CommunityPermission} className="mt-4 px-8 py-2 text-2xl text-white bg-blue-500 rounded-full">바로가기</Link>
            </div>
        </div>
      </Carousel>
    </div>
  );
}
