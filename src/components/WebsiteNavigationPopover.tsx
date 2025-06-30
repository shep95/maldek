
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

interface WebsiteNavigationPopoverProps {
  trigger: string;
  children: React.ReactNode;
}

const WebsiteNavigationPopover = ({ trigger, children }: WebsiteNavigationPopoverProps) => {
  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger className="text-white hover:text-white/80 transition-colors text-sm lg:text-base">
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 bg-black/90 backdrop-blur-sm border-white/20 text-white p-6"
        align="center"
      >
        {children}
      </HoverCardContent>
    </HoverCard>
  );
};

export default WebsiteNavigationPopover;
