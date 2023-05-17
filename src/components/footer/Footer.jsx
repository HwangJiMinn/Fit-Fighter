import React from "react";
import { FaFacebook, FaGithub, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="text-gray-700 align-center mt-24 mb-24 flex flex-col items-center">
      <div className="text-3xl font-bold mb-2 flex items-center" >
        <img
          src="/로고.png"
          alt="Fit Fighter"
          className="w-10 h-10 mr-2"
        />
        Fit Fighter
      </div>
      <div className="flex text-3xl text-center mb-2">
        <div className="cursor-pointer mr-5">
          <a href="https://www.facebook.com/profile.php?id=100006829470166">
            <FaFacebook />
          </a>
        </div>
        <div className="cursor-pointer">
          <a href="https://www.instagram.com/ji_mn_i/">
            <FaInstagram />
          </a>
        </div>
        <div className="cursor-pointer ml-5">
          <a href="https://github.com/HwangJiMinn">
            <FaGithub />
          </a>
        </div>
      </div>
      <div>Copyright © 2023 Fit Fighter</div>
    </footer>
  );
}

export default Footer;
