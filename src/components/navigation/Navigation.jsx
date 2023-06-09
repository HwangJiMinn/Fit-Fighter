import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../useAuth";
import "font-awesome/css/font-awesome.min.css";

const Navigation = () => {
  const { isLoggedIn } = useAuth(); // 커스텀훅 사용(로그인 확인용)
  const [menuOpen, setMenuOpen] = useState(false);

  const CommunityPermission = isLoggedIn ? "/community" : "/login"; // 로그인이 되어있지 않다면 커뮤니티 페이지 이용 불가

  return (
    <nav className="bg-gray-100 py-4 top-0 left-0 w-full z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <Link
            to="/"
            className="text-3xl font-bold text-red-800 flex items-center"
          >
            <img
              src="/로고.png"
              alt="Fit Fighter"
              className="w-20 h-20 mr-2"
            />
            Fit Fighter
          </Link>
        </div>
        <div className="hidden md:flex">
          <ul className="flex items-center space-x-4">
            {renderMenuItems(isLoggedIn)}
          </ul>
        </div>
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            <i className="fas fa-bars text-3xl"></i>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden mt-4">
          <ul className="flex flex-col items-start">
            {renderMenuItems(isLoggedIn)}
          </ul>
        </div>
      )}
    </nav>
  );

  function renderMenuItems(isLoggedIn) {
    return (
      <>
        <li className="my-1.5">
          <Link
            to="/kcalPage"
            className="px-4 py-2 text-gray-700 hover:bg-gray-700 hover:text-white rounded"
          >
            칼로리 계산기
          </Link>
        </li>
        <li className="my-1.5">
          <Link
            to="/food"
            className="px-4 py-2 text-gray-700 hover:bg-gray-700 hover:text-white rounded"
          >
            음식
          </Link>
        </li>
        <li className="my-1.5">
          <Link
            to="/exercisePage"
            className="px-4 py-2 text-gray-700 hover:bg-gray-700 hover:text-white rounded"
          >
            운동
          </Link>
        </li>
        <li className="my-1.5">
          <Link
            to={CommunityPermission}
            className="px-4 py-2 text-gray-700 hover:bg-gray-700 hover:text-white rounded"
          >
            커뮤니티
          </Link>
        </li>
        {isLoggedIn ? (
          <>
            <li className="my-1.5">
              <Link
                to="/userprofile"
                className="px-4 py-2 text-blue-700 hover:bg-gray-700 hover:text-blue-400 rounded"
              >
                내정보/로그아웃
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="my-1.5">
              <Link
                to="/logIn"
                className="px-4 py-2 text-blue-700 hover:bg-gray-700 hover:text-blue-400 rounded"
              >
                로그인/회원가입
              </Link>
            </li>
          </>
        )}
      </>
    );
  }
};

export default Navigation;
