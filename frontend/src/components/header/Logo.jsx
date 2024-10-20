import React from "react";
import { motion } from "framer-motion";

// Logo component.
const Logo = () => {
  return (
    // Semantic meaning for accessibility and SEO.
    <div aria-label="Blog">
      <a href="/">
        <motion.div
          className="flex items-center gap-1"
          whileHover={{
            scale: 1.2,
            transition: { duration: 0.3 },
            ease: [0, 0.71, 0.2, 1.01],
            
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0, 0.71, 0.2, 1.01],
              scale: {
                type: "spring",
                damping: 7,
                stiffness: 100,
                restDelta: 0.001,
              },
            }}
          >
            <span className="font-logoMain font-extrabold text-5xl text-gradient">
              B
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{
              duration: 0.3,
              rotate: {
                type: "spring",
                damping: 7,
                stiffness: 100,
                restDelta: 0.001,
              },
            }}
          >
            <span className="font-logoSub font-extrabold text-2xl text-gradient">
              log
            </span>
          </motion.div>
        </motion.div>
      </a>
    </div>
  );
};

export default Logo;
