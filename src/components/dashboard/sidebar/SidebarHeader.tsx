import { SidebarProfile } from "./SidebarProfile";

export const SidebarHeader = () => {
  return (
    <div className="flex items-center gap-4 p-4">
      <h2 className="text-2xl font-bold text-accent">Maldek</h2>
      <div className="ml-auto">
        <SidebarProfile />
      </div>
    </div>
  );
};