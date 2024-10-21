import React, { forwardRef } from "react";
import { motion } from "framer-motion";

// The children will be scaled up when hovered.
// This is not a real button, but a wrapper for any component.
const MotionBtn = forwardRef(({ children, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      {...props}
      className="cursor-pointer"
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.div>
  );
});

export default MotionBtn;
