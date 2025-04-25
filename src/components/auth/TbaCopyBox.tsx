
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import React from "react";

const TBA_TEXT = "TBA";

export const TbaCopyBox: React.FC = () => {
  const handleCopy = () => {
    navigator.clipboard.writeText(TBA_TEXT);
    toast.success(`Copied: ${TBA_TEXT}`);
  };

  return (
    <motion.button
      onClick={handleCopy}
      type="button"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.03 }}
      className={`
        group flex items-center gap-2 px-6 py-2 rounded-xl 
        bg-white/10 border border-accent/30 shadow-lg 
        backdrop-blur-md transition-all
        hover:bg-accent hover:text-white hover:shadow-xl
        active:scale-95
        cursor-pointer select-none
      `}
      aria-label="Copy TBA"
      style={{ minWidth: 120 }}
    >
      <span className="
        flex items-center gap-2 font-bold text-lg 
        tracking-wide text-accent group-hover:text-white"
      >
        {TBA_TEXT}
      </span>
      <Copy className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
      <span className="ml-2 text-xs font-medium opacity-70 group-hover:opacity-100">
        Tap to Copy
      </span>
    </motion.button>
  );
};
