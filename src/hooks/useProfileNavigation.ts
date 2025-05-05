
import { useNavigate } from "react-router-dom";

export const useProfileNavigation = () => {
  const navigate = useNavigate();

  const navigateToProfile = (username: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent event bubbling
    }
    
    // If username already has @ prefix, use it as is, otherwise add it
    const formattedUsername = username.startsWith('@') ? username : `@${username}`;
    console.log("Navigating to profile:", formattedUsername);
    navigate(`/${formattedUsername}`);
  };

  return { navigateToProfile };
};
