import React from "react";
import { useNavigate } from "react-router-dom";

const CommunityCard = ({ image, text, navigateTo }) => {
  const navigate = useNavigate(); // 각 커뮤니티 사진 및 설명 랜더링

  const handleClick = () => {
    navigate(navigateTo);
  };

  return (
    <div
      className="cursor-pointer mt-20 flex flex-col items-center"
      onClick={handleClick}
    >
      <img
        src={image}
        alt={text}
        className="w-72 h-72 object-cover items-center "
      ></img>
      <span className="text-black text-2xl font-bold mt-5">{text}</span>
    </div>
  );
};

export default function Community() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-4 ">
        <CommunityCard
          image="../../../public/루틴.jpg"
          text="오늘의 루틴!"
          navigateTo="/myroutine"
        />
        <CommunityCard
          image="../../../public/요리.jpg"
          text="나만의 식단 레시피"
          navigateTo="/myfood"
        />
      </div>
    </div>
  );
}
