import React from "react";
import { motion } from "framer-motion";

// The children will be scaled up when hovered.
// This is not a real button, but a wrapper for any component.
const MotionBtn = ({ children }) => {
  return (
    <motion.div
      className="cursor-pointer"
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.div>
  );
};

export default MotionBtn;
