import React from "react";
import { motion } from "framer-motion";

// The children will be scaled up when hovered.
const MotionBtn = ({ children }) => {
  return <motion.div whileHover={{ scale: 1.3 }}>{children}</motion.div>;
};

export default MotionBtn;
