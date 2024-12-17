import { SidebarProfile } from "./SidebarProfile";

export const SidebarHeader = () => {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex items-center">
        <div className="bg-black rounded-lg w-8 h-8 flex items-center justify-center">
          <span className="text-white text-xl font-black" style={{ fontFamily: "BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, Arial, sans-serif" }}>B</span>
        </div>
        <span className="ml-2 text-2xl font-bold">osley</span>
      </div>
      <div className="ml-auto">
        <SidebarProfile />
      </div>
    </div>
  );
};