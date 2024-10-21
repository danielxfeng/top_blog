import React from "react";
import { motion } from "framer-motion";

// The children will be scaled up when hovered.
const MotionLink = ({ children }) => {
  return (
    <motion.span
      className="inline-block underline"
      whileHover={{
        scale: 1.1,
        transition: { duration: 0.2 },
        ease: [0, 0.71, 0.2, 1.01],
      }}
      whileTap={{ scale: 0.9 }}
    >
      {children}
    </motion.span>
  );
};

export default MotionLink;
