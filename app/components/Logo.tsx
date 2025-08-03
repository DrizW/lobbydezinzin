"use client";
import { useState } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({ size = "md", className = "" }: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div 
      className={`font-bold ${sizeClasses[size]} ${className} cursor-pointer transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative">
        <span className={`bg-gradient-to-r from-orange-500 via-red-600 to-yellow-500 bg-clip-text text-transparent transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}>
          LOBBY
        </span>
        <span className={`bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}>
          DEZINZIN
        </span>
        <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-blue-500 transition-all duration-300 ${isHovered ? 'w-full' : 'w-0'}`}></div>
      </span>
      <span className="ml-2 text-xs text-gray-400 font-normal">WARZONE</span>
    </div>
  );
} 