import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from 'react-router-dom';
import useAuth from '../../useAuth';

export default function Main() {
    const { isLoggedIn } = useAuth()

    const CommunityPermission = isLoggedIn ? "/Community" : "login"

    return (
        <div className="mt-20">
        <Carousel>
            <div>
                <img src="../../../public/칼로리 계산기.jpg" alt="Kcalcalculator" />
                <Link className="legend text-4xl" to="/kcalPage">당신의 기초대사량과 하루 권장 칼로리를 계산해보세요!</Link>
            </div>
            <div>
                <img
                    src="../../../public/음식.jpg"
                    alt="food"
                />
                <Link className="legend text-4xl" to="/food">음식의 성분을 검색해보세요!</Link>
            </div>
            <div>
                <img
                    src="../../../public/운동.jpg"
                    alt="exercise"
                />
                <Link className="legend text-4xl" to="/excercisePage">운동 정보를 알아보세요!</Link>
            </div>
            <div>
                <img
                    src="../../../public/커뮤니티.jpg"
                    alt="community"
                />
                <Link className="legend text-4xl" to={CommunityPermission}>소통을 통해 더욱 재밌게 운동을 즐겨봐요!</Link>
            </div>
        </Carousel>
        </div>
    );
}