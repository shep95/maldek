
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface PostSuccessAnimationProps {
  onComplete: () => void;
}

export const PostSuccessAnimation = ({ onComplete }: PostSuccessAnimationProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Automatically remove animation after completion (3 seconds)
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 300); // Give time for fade-out
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="post-success-animation" onClick={() => {
      setShow(false);
      setTimeout(onComplete, 300);
    }}>
      <div className="post-success-container animate-fade-in">
        <div className="post-success-circle">
          <svg width="80" height="80" viewBox="0 0 90 90" className="animate-circle-scale">
            <circle
              cx="45"
              cy="45"
              r="45"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="5"
              className="animate-circle-complete"
            />
            <path
              d="M30 45 L40 55 L60 35"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-checkmark-draw"
            />
          </svg>
        </div>
        <div className="post-success-text animate-fade-success">
          Post Sent!
        </div>
      </div>
    </div>
  );
};
