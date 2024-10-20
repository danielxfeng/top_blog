import React from "react";
import { motion } from "framer-motion";

// The children will be scaled up when hovered.
const MotionLink = ({ children }) => {
  return (
    <motion.div className="inline-block" whileHover={{ scale: 1.1 }}>
      {children}
    </motion.div>
  );
};

export default MotionLink;
