import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Timer", path: "/", icon: "⏱️" },
  { label: "Log", path: "/log", icon: "📋" },
  { label: "Water", path: "/hydration", icon: "💧" },
  { label: "Progress", path: "/progress", icon: "📈" },
  { label: "Settings", path: "/settings", icon: "⚙️" },
];

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f1a] border-t border-[#2a2a4a] flex">
      {tabs.map(({ label, path, icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 min-h-[44px] text-xs gap-0.5 ${
              isActive ? "text-indigo-400" : "text-gray-500"
            }`
          }
        >
          <span className="text-lg leading-none">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
