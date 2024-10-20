import React from "react";
import MotionLink from "./motionWrapper/MotionLink";

const Footer = () => {
  return (
    <footer className="flex-none h-16 flex justify-around items-center">
      <div>
        &copy; 2024{" "}
        <a
          className="underline"
          href="https://github.com/danielxfeng/top_blog"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MotionLink>Fancy Blog</MotionLink>
        </a>
      </div>
      <div>
        Made by ❤️<em>Daniel</em>❤️
      </div>
    </footer>
  );
};

export default Footer;
