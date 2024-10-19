import React from "react";
import { motion } from "framer-motion";

// Logo component.
const Logo = () => {
  return (
    // Semantic meaning for accessibility and SEO.
    <a href="/">
      <div className="flex items-center gap-1" aria-label="Blog">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-logoMain font-extrabold text-5xl text-gradient">
            B
          </span>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-logoSub font-bold text-2xl text-gradient">
            log
          </span>
        </motion.div>
      </div>
    </a>
  );
};

export default Logo;
