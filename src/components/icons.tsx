
import React from "react";
import { 
  LucideProps, 
  Moon, 
  Sun, 
  Laptop, 
  Settings,
  LogOut,
  User,
  MessageSquare,
  Home,
  Menu,
  Search
} from "lucide-react";

export type IconProps = LucideProps;

export const Icons = {
  logo: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  ),
  sun: Sun,
  moon: Moon,
  laptop: Laptop,
  settings: Settings,
  logout: LogOut,
  user: User,
  message: MessageSquare,
  home: Home,
  menu: Menu,
  search: Search,
};
