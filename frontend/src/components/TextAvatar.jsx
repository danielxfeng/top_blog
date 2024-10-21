import React from "react";

const TextAvatar = ({ text }) => {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-md">
      {text ? text[0].toUpperCase() : "U"}
    </div>
  );
}

export default TextAvatar;
