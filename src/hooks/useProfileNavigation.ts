
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useProfileNavigation = () => {
  const navigate = useNavigate();
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const navigateToProfile = (username: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // Prevent default behavior
      e.stopPropagation(); // Prevent event bubbling
    }
    
    // If username already has @ prefix, use it as is, otherwise add it
    const formattedUsername = username.startsWith('@') ? username : `@${username}`;
    console.log("Navigating to profile:", formattedUsername);
    
    // Instead of navigating, open the popup
    setSelectedProfile(username);
    setProfilePopupOpen(true);
  };

  const closeProfilePopup = () => {
    setProfilePopupOpen(false);
  };

  const viewFullProfile = (username: string) => {
    // If username already has @ prefix, use it as is, otherwise add it
    const formattedUsername = username.startsWith('@') ? username : `@${username}`;
    // Navigate to the full profile page
    navigate(`/${formattedUsername}`);
    // Close the popup
    closeProfilePopup();
  };

  return { 
    navigateToProfile, 
    profilePopupOpen, 
    selectedProfile, 
    closeProfilePopup,
    viewFullProfile
  };
};
