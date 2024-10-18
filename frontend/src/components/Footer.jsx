import React from "react";

const Footer = () => {
  return (
    <footer className="flex-none h-16 flex justify-around items-center">
      <p>
        &copy; 2024{" "}
        <a
          className="underline"
          href="https://github.com/danielxfeng/top_blog"
          target="_blank"
          rel="noopener noreferrer"
        >
          Fancy Blog
        </a>
      </p>
      <p>
        Made by ❤️<em>Daniel</em>❤️
      </p>
    </footer>
  );
};

export default Footer;
