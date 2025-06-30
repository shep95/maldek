
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="relative z-20 w-full">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              Bosley
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-white/70 hover:text-white transition-colors">
              Features
            </a>
            <a href="#about" className="text-white/70 hover:text-white transition-colors">
              About
            </a>
            <a href="#contact" className="text-white/70 hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 bg-black/40 backdrop-blur-xl rounded-lg border border-white/10 p-4"
            >
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-white/70 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#about" className="text-white/70 hover:text-white transition-colors">
                  About
                </a>
                <a href="#contact" className="text-white/70 hover:text-white transition-colors">
                  Contact
                </a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
