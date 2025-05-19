
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import React from "react";

const TBA_TEXT = "AhNfqqgCSKvtUKgwnhxjFNnsyKKH4KtBQ99gvAjmmoon";

export const TbaCopyBox: React.FC = () => {
  const handleCopy = () => {
    navigator.clipboard.writeText(TBA_TEXT);
    toast.success(`Copied: ${TBA_TEXT}`);
  };

  return (
    <div className="relative">
      <motion.div
        onClick={handleCopy}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.03 }}
        className="
          group flex items-center gap-2 px-6 py-2 rounded-xl 
          bg-white/10 border border-accent/30 shadow-lg 
          backdrop-blur-md transition-all
          hover:bg-accent hover:shadow-xl
          cursor-pointer select-none
          copy-box
        "
        aria-label="Copy TBA"
        style={{ minWidth: 120 }}
      >
        <input 
          type="text" 
          className="
            copy-input bg-transparent border-none outline-none 
            text-lg font-bold text-accent group-hover:text-white
            w-full cursor-pointer
          " 
          value="Copy Coin Address To Buy" 
          readOnly 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.select();
            handleCopy();
          }}
        />
        <Copy className="w-5 h-5 text-accent group-hover:text-white transition-colors flex-shrink-0" />
      </motion.div>
    </div>
  );
};
