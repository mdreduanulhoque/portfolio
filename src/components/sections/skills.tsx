"use client";

import * as React from "react";
import { useMemo } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { Skill } from "@/lib/data";
import { fallbackSkills } from "@/lib/data";
import {
  Code2,
  Cpu,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";



// Helper to format generic, clean skill names
function cleanSkillName(raw: string): string {
  if (!raw) return "";
  const name = raw.replace(/\.exe$/i, "").replace(/_/g, " ").trim();
  const lower = name.toLowerCase();
  if (lower === "cplusplus") return "C++";
  if (lower === "nodejs") return "Node.js";
  if (lower === "expressjs" || lower === "express js" || lower === "express") return "Express.js";
  if (lower === "mysql") return "MySQL";
  if (lower === "python") return "Python";
  if (lower === "c language") return "C Language";
  if (lower === "tailwind css") return "Tailwind CSS";
  return name;
}

// Authentic Tech Brand Vector Logos
function TechLogo({ name }: { name: string }) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9+]/g, "");

  // Python (Official)
  if (normalized.includes("python")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="none">
        <path
          d="M11.91 2C6.72 2 7.04 4.25 7.04 4.25L7.05 6.6H12V7.38H5.16C3.25 7.38 2 8.64 2 11.23C2 13.82 3.09 14.88 4.7 14.88H6.07V13.06C6.07 10.96 7.84 9.19 9.94 9.19H14.19C15.65 9.19 16.83 8.01 16.83 6.55V4.25C16.83 2 11.91 2 11.91 2ZM9.56 3.44C10.15 3.44 10.63 3.92 10.63 4.51C10.63 5.1 10.15 5.58 9.56 5.58C8.97 5.58 8.49 5.1 8.49 4.51C8.49 3.92 8.97 3.44 9.56 3.44Z"
          fill="#387EB8"
        />
        <path
          d="M12.09 22C17.28 22 16.96 19.75 16.96 19.75L16.95 17.4H12V16.62H18.84C20.75 16.62 22 15.36 22 12.77C22 10.18 20.91 9.12 19.3 9.12H17.93V10.94C17.93 13.04 16.16 14.81 14.06 14.81H9.81C8.35 14.81 7.17 15.99 7.17 17.45V19.75C7.17 22 12.09 22 12.09 22ZM14.44 20.56C13.85 20.56 13.37 20.08 13.37 19.49C13.37 18.9 13.85 18.42 14.44 18.42C15.03 18.42 15.51 18.9 15.51 19.49C15.51 20.08 15.03 20.56 14.44 20.56Z"
          fill="#FFE052"
        />
      </svg>
    );
  }

  // Express.js (Official Minimalist Badge)
  if (normalized.includes("express")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 256 256">
        <rect width="256" height="256" rx="56" fill="#222222" />
        <path
          fill="#FFFFFF"
          d="M214 174a11 11 0 0 1-13.6-5.2c-7.8-11.7-16.5-22.9-24.8-34.3l-3.6-4.8c-9.9 13.2-19.8 25.9-28.8 39.1a10.5 10.5 0 0 1-13 5.1l37.1-49.7-34.5-45a11.5 11.5 0 0 1 13.7 4.8c8 11.7 16.9 22.9 25.7 34.7 8.9-11.7 17.7-22.9 25.9-34.6a10.3 10.3 0 0 1 12.9-4.8l-13.4 17.7c-6 7.9-11.9 15.9-18.1 23.6a4.8 4.8 0 0 0 0 7.2c11.5 15.2 22.8 30.5 34.5 46.1M41 123.5c1-4.8 1.6-10 3-14.9 8.3-29.5 42.1-41.8 65.4-23.5 13.6 10.7 17 25.9 16.4 42.9H49c-1.2 30.5 20.8 48.9 48.9 39.5a29.2 29.2 0 0 0 18.6-20.7c1.5-4.8 3.9-5.6 8.4-4.2a38.9 38.9 0 0 1-18.6 28.4 45.1 45.1 0 0 1-52.5-6.7 47.2 47.2 0 0 1-11.8-27.7c0-1.6-.6-3.3-1-4.8zm8.1-2.1h69.4c-.4-22.1-14.4-37.8-33-37.9-20.7-.3-35.5 15-36.4 37.9z"
        />
      </svg>
    );
  }

  // MySQL (Official Dolphin Mark)
  if (normalized.includes("mysql") || normalized === "sql") {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 512 349">
        <path
          fill="#00758F"
          d="M152.31 230.297l15.56 50.487c3.496 11.463 4.954 19.465 4.37 24.026q12.765-34.188 17.839-74.513h18.71q-12.069 65.65-31.827 95.41c-10.262 15.289-21.504 22.933-33.746 22.933c-3.264 0-7.288-.986-12.063-2.944v-10.55c2.333.342 5.07.525 8.218.525q8.565-.002 13.816-4.742c4.193-3.849 6.292-8.175 6.292-12.97c0-3.274-1.637-9.993-4.896-20.157l-21.68-67.505zM33.223 199.266l28.5 86.956h.176l28.675-86.956h23.428c5.13 43.124 8.16 82.581 9.09 118.346H103.34q-1.044-50.148-5.768-94.32H97.4l-30.078 94.32H52.28l-29.896-94.32h-.176q-3.325 42.422-4.196 94.32H0c1.164-42.08 4.077-81.525 8.739-118.346z"
        />
        <path
          fill="#F29111"
          d="M352.498 197.51c30.657 0 45.986 19.586 45.986 58.739c0 21.276-4.61 37.347-13.821 48.204c-1.66 1.984-3.495 3.698-5.427 5.286l21.695 10.727l-.021-.001l-7.703 13.302l-28.253-16.485q-7.026 2.08-15.451 2.08c-15.053 0-26.297-4.387-33.731-13.15c-8.16-9.694-12.238-24.955-12.238-45.757c0-21.156 4.602-37.166 13.816-48.037c8.392-9.944 20.11-14.909 35.148-14.909m-93.88.172c10.957 0 20.92 2.932 29.894 8.775l-4.558 10.157c-7.679-3.264-15.25-4.903-22.716-4.903c-6.058 0-10.726 1.458-13.98 4.392c-3.272 2.908-5.296 6.65-5.296 11.212c0 7.01 4.994 13.089 14.215 18.225a816 816 0 0 1 9.031 5.011l.688.387l.345.194l.689.387l.344.194l.688.388c6.98 3.935 13.548 7.691 13.548 7.691c9.22 6.545 13.816 13.523 13.816 25.016c0 10.037-3.678 18.276-11.01 24.723c-7.337 6.418-17.194 9.636-29.538 9.636c-11.545 0-22.734-3.704-33.572-11.05l5.07-10.166c9.327 4.675 17.767 7.01 25.346 7.01c7.108 0 12.672-1.587 16.697-4.721c4.017-3.157 6.424-7.56 6.424-13.143c0-7.027-4.888-13.034-13.855-18.073a898 898 0 0 1-8.395-4.697l-.687-.389c-1.262-.713-2.533-1.435-3.778-2.142l-.675-.384c-6.055-3.444-11.29-6.453-11.29-6.453c-8.964-6.557-13.459-13.592-13.459-25.184c0-9.587 3.352-17.336 10.046-23.231q10.066-8.862 25.968-8.862m175.895 1.584v103.788h37.238v14.558h-56.124V199.266zm-74.417 12.798c-18.066 0-27.104 14.91-27.104 44.71c0 17.07 2.395 29.448 7.176 37.163c4.428 7.14 11.363 10.703 20.806 10.703c18.066 0 27.103-15.026 27.103-45.064c0-16.831-2.395-29.103-7.17-36.822c-4.433-7.124-11.365-10.69-20.81-10.69"
        />
        <path
          fill="#00758F"
          d="M303.218 7.333c5.993-14.726 26.948-3.574 35.08 1.57c1.993 1.287 4.279 4.006 6.564 5.011c3.565.14 7.127.419 10.698.568c6.698 1.574 12.972 2.86 18.25 5.866c24.528 14.445 40.495 29.165 55.19 53.479c3.14 5.15 4.709 10.723 7.274 16.296c3.56 8.307 7.56 17.027 11.692 24.882c1.85 3.724 3.281 7.865 5.85 11.01c1.003 1.438 3.852 1.862 5.555 2.721c4.708 2.437 10.412 4.287 14.84 7.147c8.269 5.156 16.264 11.3 23.532 17.59c2.709 2.428 4.555 5.865 7.136 8.433v1.296c-2.291.703-4.574 1.423-6.859 2c-4.991 1.282-9.412.992-14.254 2.275c-2.992.868-6.707 2.013-9.845 2.304l.29.292c1.846 5.275 11.834 9.565 16.402 12.72c5.548 4.004 10.689 8.86 14.827 14.437c1.429 1.423 2.858 2.718 4.28 4.137c.994 1.438 1.274 3.298 2.28 4.58v.434c-1.114-.393-1.915-1.143-2.674-1.927l-.453-.473c-.453-.47-.91-.932-1.431-1.313c-3.148-2.15-6.274-4.722-9.422-6.721c-5.412-3.434-11.689-5.427-17.246-8.874c-3.142-2.001-6.137-4.28-9.132-6.57c-2.715-2.007-5.705-5.861-7.411-8.721c-1.005-1.58-1.143-3.437-2.291-4.58c.205-1.909 1.954-2.476 3.719-2.942l.406-.107c.609-.158 1.205-.316 1.725-.525c7.414-3.148 16.253-4.29 27.667-4.004c-.43-2.866-7.562-6.437-9.839-8.153c-4.57-3.294-9.409-6.731-14.257-9.729c-2.569-1.57-6.996-2.716-9.842-3.999c-3.851-1.574-12.41-3.147-14.544-6.145c-3.625-4.726-6.229-10.363-8.757-16.057l-.688-1.554l-.69-1.553c-2.988-6.857-6.7-14.006-9.695-21.027c-1.566-3.425-2.285-6.431-4-9.716c-10.407-20.158-25.81-37.035-44.485-48.904c-6.137-3.862-12.98-7.436-20.534-9.865c-4.281-1.293-9.419-.578-13.98-1.57h-3.002c-2.562-.722-4.701-3.438-6.7-4.87c-4.415-2.998-8.837-5.011-14.117-7.15c-1.85-.858-7.133-2.856-8.977-1.283c-1.142.287-1.721.718-2.002 1.864c-1.136 1.71-.137 4.286.57 5.863c2.142 4.57 5.134 7.286 7.85 11.148c2.416 3.425 5.417 7.287 7.13 11.011c3.696 8.005 5.417 16.874 8.842 24.878c1.27 3.01 3.279 6.435 5.128 9.15c1.567 2.155 4.416 3.713 5.278 6.441c1.718 2.86-2.572 12.297-3.565 15.294c-3.715 11.727-2.995 28.028 1.283 38.193l.228.536l.228.543c1.562 3.723 3.234 7.732 7.387 8.773c.286-.284 0-.135.567-.284c1.005-7.868 1.288-15.445 4-21.601c1.567-3.849 4.696-6.57 6.841-9.712c1.43.856 1.43 3.437 2.282 5.145c1.856 4.43 3.849 9.287 6.137 13.73c4.696 9.15 9.98 18.021 15.967 26.025c2.005 2.859 4.85 6.006 7.416 8.581c1.143.997 2.423 1.573 3.282 2.856h.28v.432c-4.278-1.577-6.99-6.003-10.402-8.587c-6.424-4.857-14.117-12.151-18.545-19.15c-1.852-4.018-3.854-7.869-5.85-11.867v-.289c-.853 1.142-.567 2.276-.994 4.004c-1.852 7.145-.426 15.296-6.843 17.866c-7.274 3.01-12.7-4.857-14.977-8.432c-7.276-11.866-9.269-31.884-4.138-48.043c1.14-3.577 1.295-7.867 3.285-10.723c-.43-2.582-2.42-3.288-3.571-4.87c-1.996-2.704-3.705-5.854-5.268-8.857c-3.002-5.866-5.138-12.875-7.417-19.166c-1.002-2.569-1.289-5.148-2.288-7.58c-1.704-3.712-4.845-7.436-7.268-10.72c-3.281-4.72-12.837-13.868-8.985-23.168m46.772 28.015c.381.382.841.716 1.317 1.045l.574.394c.765.53 1.506 1.088 1.96 1.848c.72 1.006.854 1.999 1.716 3.007c0 3.437-.996 5.722-3.007 7.146c0 0-.137.15-.278.29c-1.14-2.291-2.139-4.57-3.287-6.859c-1.414-1.998-3.413-3.583-4.565-5.866h-.277v-.287c1.721-.425 3.428-.718 5.847-.718"
        />
      </svg>
    );
  }

  // HTML5 (Official W3C)
  if (normalized.includes("html")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M4 2L5.8 20.2L12 22L18.2 20.2L20 2H4Z" fill="#E44D26" />
        <path d="M12 20.2L16.8 18.8L18.3 3.6H12V20.2Z" fill="#F16529" />
        <path d="M12 8.1H9.1L8.9 6H15.1L15 4H8.7L8.3 8.1H12V8.1ZM12 12.3H9.4L9.6 14.5L12 15.2V17.3L8 16.1L7.7 12.3H12V10.2H8.1L8 8.1H15.9L15.6 12.3H12V12.3Z" fill="#EBEBEB" />
        <path d="M12 8.1V6H15.1L14.9 8.1H12ZM12 15.2L14.4 14.5L14.7 12.3H12V10.2H15.8L15.3 16.1L12 17.3V15.2Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // CSS3 (Official W3C)
  if (normalized.includes("css") && !normalized.includes("tailwind")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M4 2L5.8 20.2L12 22L18.2 20.2L20 2H4Z" fill="#1572B6" />
        <path d="M12 20.2L16.8 18.8L18.3 3.6H12V20.2Z" fill="#33A9DC" />
        <path d="M12 8.1H14.9L15.1 6H8.9L8.7 8.1H12V8.1ZM12 12.3H9.4L9.6 14.5L12 15.2V17.3L8 16.1L7.7 12.3H12V10.2H8.1L8 8.1H15.9L15.6 12.3H12V12.3Z" fill="#EBEBEB" />
        <path d="M12 8.1V6H15.1L14.9 8.1H12ZM12 15.2L14.4 14.5L14.7 12.3H12V10.2H15.8L15.3 16.1L12 17.3V15.2Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // Tailwind CSS (Official)
  if (normalized.includes("tailwind")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path
          fill="#38BDF8"
          d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.335 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.335 13.382 8.975 12 6.001 12z"
        />
      </svg>
    );
  }

  // JavaScript (Official Devicon / JS Foundation Vector)
  if (normalized.includes("javascript") || normalized === "js") {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-md overflow-hidden" viewBox="0 0 128 128">
        <path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z" />
        <path
          fill="#323330"
          d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z"
        />
      </svg>
    );
  }

  // jQuery (Official)
  if (normalized.includes("jquery")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#0769AD" />
        <path
          d="M17.8 7.3c-.3-.2-.7-.2-.9.1-.6.7-1.4 1.2-2.3 1.5-.7.2-1.5.3-2.2.1-.8-.2-1.5-.6-2-1.2-.6-.6-.9-1.4-1-2.2 0-.4-.4-.7-.8-.7-.4 0-.8.3-.8.7.1 1.2.6 2.3 1.4 3.1.6.6 1.4 1.1 2.3 1.3-.8.4-1.7.6-2.6.5-.9-.1-1.8-.5-2.5-1.1-.3-.3-.7-.2-1 .1-.3.3-.2.7.1 1 1 1 2.3 1.6 3.6 1.7 1.3.1 2.6-.2 3.8-.9 1.1-.7 2-1.6 2.6-2.8.2-.4.1-.7-.1-.9z"
          fill="#FFFFFF"
        />
        <path
          d="M12.4 13.5c-.3-.2-.7-.1-.9.2-.6 1-1.5 1.7-2.6 2.1-.9.3-1.8.4-2.7.1-.9-.3-1.6-.9-2.1-1.7-.5-.8-.7-1.8-.6-2.8 0-.4-.3-.8-.7-.8s-.8.3-.8.7c-.1 1.3.2 2.6.9 3.7.7 1.1 1.7 1.9 2.9 2.3 1.2.4 2.4.3 3.6-.1 1.4-.5 2.5-1.5 3.3-2.8.2-.3.1-.7-.3-.9z"
          fill="#7ACEF4"
        />
      </svg>
    );
  }

  // Node.js (Official)
  if (normalized.includes("node")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M12 1.5L2.8 6.8V17.2L12 22.5L21.2 17.2V6.8L12 1.5Z" fill="#539E43" />
        <path d="M12 3.8L19.4 8.1V16.7L12 21L4.6 16.7V8.1L12 3.8Z" fill="#222222" />
        <path d="M10.8 8.8V14.4H13.2V10.8L15 14.4H16.8V8.8H14.4V12.4L12.6 8.8H10.8Z" fill="#539E43" />
      </svg>
    );
  }

  // C Language (Official ISO C Isometric Badge)
  if (normalized === "clanguage" || normalized === "c") {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 256 288">
        <path
          fill="#a9b9cb"
          d="M255.987 85.672c-.002-4.843-1.037-9.122-3.129-12.794c-2.055-3.612-5.134-6.638-9.262-9.032c-34.081-19.67-68.195-39.28-102.264-58.97c-9.185-5.307-18.091-5.114-27.208.27c-13.565 8.008-81.481 46.956-101.719 58.689C4.071 68.665.015 76.056.013 85.663C0 125.221.013 164.777 0 204.336c.002 4.736.993 8.932 2.993 12.55c2.056 3.72 5.177 6.83 9.401 9.278c20.239 11.733 88.164 50.678 101.726 58.688c9.121 5.387 18.027 5.579 27.215.27c34.07-19.691 68.186-39.3 102.272-58.97c4.224-2.447 7.345-5.559 9.401-9.276c1.997-3.618 2.99-7.814 2.992-12.551c0 0 0-79.094-.013-118.653"
        />
        <path
          fill="#7f8b99"
          d="M141.101 5.134c-9.17-5.294-18.061-5.101-27.163.269C100.395 13.39 32.59 52.237 12.385 63.94C4.064 68.757.015 76.129.013 85.711C0 125.166.013 164.62 0 204.076c.002 4.724.991 8.909 2.988 12.517c2.053 3.711 5.169 6.813 9.386 9.254a9009 9009 0 0 0 20.159 11.62L219.625 50.375c-26.178-15.074-52.363-30.136-78.524-45.241"
        />
        <path
          fill="#ffffff"
          d="m154.456 126.968l39.839.281c0-16.599-16.802-57.249-64.973-57.249c-30.691 0-71.951 19.512-71.951 75.61S97.818 220 129.322 220c51.017 0 63.21-35.302 63.21-55.252l-38.007-2.173s1.017 23.075-25.406 23.075c-24.39 0-28.46-29.878-28.46-40.04c0-15.447 5.493-40.244 28.46-40.244c22.968 0 25.337 21.602 25.337 21.602"
        />
      </svg>
    );
  }

  // C++ (Official ISO C++ Isometric Badge)
  if (normalized.includes("cplus") || normalized.includes("c++") || normalized.includes("cpp")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 256 288">
        <path
          fill="#649ad2"
          d="M255.987 84.59c-.002-4.837-1.037-9.112-3.13-12.781c-2.054-3.608-5.133-6.632-9.261-9.023c-34.08-19.651-68.195-39.242-102.264-58.913c-9.185-5.303-18.09-5.11-27.208.27c-13.565 8-81.48 46.91-101.719 58.632C4.071 67.6.015 74.984.013 84.58C0 124.101.013 163.62 0 203.141c0 4.73.993 8.923 2.993 12.537c2.056 3.717 5.177 6.824 9.401 9.269c20.24 11.722 88.164 50.63 101.726 58.631c9.121 5.382 18.027 5.575 27.215.27c34.07-19.672 68.186-39.262 102.272-58.913c4.224-2.444 7.345-5.553 9.401-9.267c1.997-3.614 2.992-7.806 2.992-12.539c0 0 0-79.018-.013-118.539"
        />
        <path
          fill="#004482"
          d="m128.392 143.476l-125.4 72.202c2.057 3.717 5.178 6.824 9.402 9.269c20.24 11.722 88.164 50.63 101.726 58.631c9.121 5.382 18.027 5.575 27.215.27c34.07-19.672 68.186-39.262 102.272-58.913c4.224-2.444 7.345-5.553 9.401-9.267z"
        />
        <path
          fill="#1a4674"
          d="M91.25 164.863c7.297 12.738 21.014 21.33 36.75 21.33c15.833 0 29.628-8.7 36.888-21.576l-36.496-21.141z"
        />
        <path
          fill="#01589c"
          d="M255.987 84.59c-.002-4.837-1.037-9.112-3.13-12.781l-124.465 71.667l124.616 72.192c1.997-3.614 2.99-7.806 2.992-12.539c0 0 0-79.018-.013-118.539"
        />
        <path
          fill="#ffffff"
          d="M249.135 148.636h-9.738v9.74h-9.74v-9.74h-9.737V138.9h9.737v-9.738h9.74v9.738h9.738zM128 58.847c31.135 0 58.358 16.74 73.17 41.709l.444.759l-37.001 21.307c-7.333-12.609-20.978-21.094-36.613-21.094c-23.38 0-42.333 18.953-42.333 42.332a42.13 42.13 0 0 0 5.583 21.003c7.297 12.738 21.014 21.33 36.75 21.33c15.659 0 29.325-8.51 36.647-21.153l.241-.423l36.947 21.406c-14.65 25.597-42.228 42.851-73.835 42.851c-31.549 0-59.084-17.185-73.754-42.707c-7.162-12.459-11.26-26.904-11.26-42.307c0-46.95 38.061-85.013 85.014-85.013m75.865 70.314v9.738h9.737v9.737h-9.737v9.74h-9.738v-9.74h-9.738V138.9h9.738v-9.738z"
        />
      </svg>
    );
  }

  // WordPress (Official)
  if (normalized.includes("wordpress")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#21759B" />
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-8.2 10c0-1.4.3-2.7.9-3.9l4.5 12.3c-3.2-1.7-5.4-4.8-5.4-8.4zm8.2 8.2c-.8 0-1.5-.1-2.2-.4l2.8-8.2 2.9 7.9c-1.1.5-2.3.7-3.5.7zm1.1-12.7c.6 0 1.2-.1 1.2-.1l-2.4 7-1.4-4.2c.4-.1.8-.2 1.3-.2.6 0 1.3.1 1.3.1zm4.9 1.1c.9 1.3 1.4 2.8 1.4 4.5 0 2.7-1.3 5.1-3.3 6.6l3.4-9.8c-.4-.5-.9-.9-1.5-1.3z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Canva (Official Gradient Circle with Signature Stylized Canva Mark)
  if (normalized.includes("canva")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="canva-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C4CC" />
            <stop offset="100%" stopColor="#7D2AE8" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="url(#canva-grad)" />
        <path
          d="M8.2 8.5c.8 0 1.4.6 1.4 1.2 0 .6-.2 1.1-.9 1.4-.4.2-.5.2-.6.1 0-.1 0-.2.1-.2.6-.5.6-.9.6-1.5 0-.4-.3-.6-.6-.6-1.2 0-3 2.7-2.7 4.6.1.8.6 1.6 1.5 1.6.3 0 .7-.1 1-.2.5-.3.8-.5 1.1-.8-.1-.9.7-2 1.9-2 .5 0 .9.2 1 .6.1.5-.4.6-.5.6s-.4 0-.4-.2c0-.1.3-.1.3-.4 0-.2-.3-.3-.5-.3-.7 0-1.1 1-1 1.6 0 .3.2.5.4.5.2 0 .5-.3.6-.8.1-.3.3-.5.6-.5.1 0 .2 0 .2.2v.1c0 .1-.1.5-.1.6 0 .1 0 .2.2.2.1 0 .4-.2.8-.5.1-.6.3-1.3.3-1.4 0-.2.1-.5.6-.5.1 0 .2 0 .2.2v.1l-.1.6c.4-.6 1.1-1 1.5-1 .2 0 .3.1.3.3 0 .1 0 .3-.1.4-.1.4-.3 1-.4 1.5 0 .1 0 .3.2.3s.7-.2 1.1-.8l.007-.004c0-.1 0-.1 0-.2 0-.4 0-.8.1-1 .1-.3.4-.5.6-.5.1 0 .2.1.2.2 0 0 0 .1 0 .1-.1.4-.2.9-.2 1.3 0 .2 0 .6.1.8 0 0 0 .1.1.1.1 0 .5-.4.9-1-.3-.2-.5-.5-.5-1 0-.7.4-1.1.9-1.1.3 0 .6.2.6.7 0 .3-.1.7-.3 1h.1c.3 0 .5-.1.6-.2.1 0 .2-.1.2-.1.3-.4.8-.7 1.4-.7.5 0 .9.2 1 .6.1.5-.4.6-.5.6-.1 0-.4 0-.4-.2 0-.2.3-.1.3-.4 0-.2-.2-.3-.4-.3-.7 0-1.1.9-1 1.6 0 .3.2.6.4.6.2 0 .5-.3.7-.8.1-.3.3-.5.6-.5.1 0 .2 0 .2.2 0 .1 0 .2-.1.7-.2.3-.2.5-.1.6 0 .3.2.5.3.6 0 0 .1.1.1.1 0 .1 0 .1-.1.1 0 0-.1 0-.1 0-.5-.2-.7-.5-.8-.9-.2.2-.4.4-.7.4-.4 0-.9-.4-1-.9a1.6 1.6 0 0 1 .1-.6c-.2.1-.4.2-.6.2h-.2c-.4.7-.9 1.1-1.3 1.3a.9.9 0 0 1-.4.1c-.1 0-.2 0-.2-.1-.1-.2-.2-.4-.2-.7-.5.5-1.1.8-1.5.8-.3 0-.5-.2-.6-.6v-.4c.1-.8.4-1.2.4-1.3 0-.1 0-.1-.1-.1-.2 0-1 .8-1.2 1.4l-.1.4c-.1.3-.4.5-.6.5-.1 0-.2 0-.2-.2v-.1l.05-.2c-.4.3-.9.5-1.1.5-.3 0-.5-.2-.5-.4-.2.3-.4.4-.8.4-.4 0-.7-.2-.9-.6-.2.3-.5.6-.9.8-.5.3-1 .5-1.7.5-.6 0-1.1-.3-1.4-.6-.4-.4-.7-1-.7-1.5-.2-1.7.8-3.8 2.4-4.8.4-.2.8-.3 1.1-.3z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // MS Office Suite (Official Microsoft Brand Tiles)
  if (normalized.includes("office") || normalized.includes("msoffice") || normalized.includes("microsoft")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 256 256" fill="none">
        <rect x="0" y="0" width="120" height="120" rx="14" fill="#F25022" />
        <rect x="136" y="0" width="120" height="120" rx="14" fill="#7FBA00" />
        <rect x="0" y="136" width="120" height="120" rx="14" fill="#00A4EF" />
        <rect x="136" y="136" width="120" height="120" rx="14" fill="#FFB900" />
      </svg>
    );
  }

  // React (Official)
  if (normalized.includes("react")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="2" fill="#61DAFB" />
      </svg>
    );
  }

  // TypeScript (Official)
  if (normalized.includes("typescript") || normalized === "ts") {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <path
          d="M12.5 10.5V12h-2v7H8.5v-7h-2v-1.5h6zm7 3.5c-.2-.8-.7-1.4-1.4-1.7-.7-.3-1.6-.4-2.5-.2-.9.2-1.6.7-2 1.4l1.3.8c.2-.4.6-.7 1.1-.8.5-.1 1 0 1.4.2.4.2.6.5.6.9 0 .3-.1.6-.4.8-.3.2-.8.4-1.4.5-.9.2-1.6.5-2.1.9-.5.4-.7 1-.7 1.8 0 .8.3 1.4.9 1.8.6.4 1.4.6 2.3.5.8 0 1.5-.2 2.1-.6.6-.4 1-.9 1.2-1.6l-1.4-.7c-.1.4-.4.8-.8 1-.4.2-.9.3-1.4.2-.4 0-.8-.1-1.1-.3-.3-.2-.4-.5-.4-.8 0-.3.1-.6.4-.8.3-.2.8-.4 1.5-.5 1-.2 1.8-.5 2.3-.9.5-.5.8-1.1.8-1.8z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Git (Official)
  if (normalized.includes("git")) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="#F05032">
        <path d="M21.62 10.84L13.16 2.38C12.67 1.89 11.87 1.89 11.38 2.38L9.62 4.14L12.07 6.59C12.62 6.41 13.25 6.53 13.7 6.98C14.15 7.43 14.27 8.06 14.09 8.61L16.48 11C17.03 10.82 17.66 10.94 18.11 11.39C18.76 12.04 18.76 13.09 18.11 13.74C17.46 14.39 16.41 14.39 15.76 13.74C15.31 13.29 15.19 12.66 15.37 12.11L13.08 9.82V15.22C13.26 15.39 13.4 15.61 13.48 15.86C13.83 16.94 13.25 18.1 12.17 18.45C11.09 18.8 9.93 18.22 9.58 17.14C9.23 16.06 9.81 14.9 10.89 14.55C11.14 14.47 11.4 14.47 11.64 14.55V9.69C11.4 9.61 11.14 9.61 10.89 9.69C10.34 9.87 9.71 9.75 9.26 9.3C8.81 8.85 8.69 8.22 8.87 7.67L6.44 5.24L2.38 11.3C1.89 11.79 1.89 12.59 2.38 13.08L10.84 21.54C11.33 22.03 12.13 22.03 12.62 21.54L21.62 12.54C22.11 12.05 22.11 11.25 21.62 10.84Z" />
      </svg>
    );
  }

  // Default Generic Code Icon
  return (
    <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
      <Code2 className="w-3.5 h-3.5" />
    </div>
  );
}

function SkillsSkeleton() {
  return (
    <section id="skills" className="py-24 bg-background text-foreground relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col items-center gap-4 mb-14 animate-pulse">
          <div className="h-7 w-32 bg-muted rounded-full" />
          <div className="h-10 w-64 bg-muted rounded-lg" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="h-14 w-36 bg-muted/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function SkillsSection() {
  const { data: skills, loading } = useFirestoreCollection<Skill>("skills");

  // Merge Firestore skills with any essential fallback skills that aren't yet in Firestore
  const rawSkills = useMemo(() => {
    if (skills.length === 0) return fallbackSkills;

    // Check existing skill names from Firestore
    const existingNames = new Set(
      skills.map((s) => cleanSkillName(s.name).toLowerCase())
    );

    // Any skill in fallbackSkills not yet in Firestore will be seamlessly merged
    const missingFallbacks = fallbackSkills.filter(
      (f) => !existingNames.has(cleanSkillName(f.name).toLowerCase())
    );

    // Combine and sort by order
    return [...skills, ...missingFallbacks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [skills]);

  // Format skills cleanly with generic names
  const formattedSkills = useMemo(() => {
    return rawSkills.map((s) => ({
      ...s,
      displayName: cleanSkillName(s.name),
      category: s.type || "General",
    }));
  }, [rawSkills]);

  if (loading) return <SkillsSkeleton />;

  return (
    <section id="skills" className="py-24 bg-background text-foreground relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center gap-4 mb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary font-mono cursor-default">
            <Sparkles className="w-3.5 h-3.5" />
            ~/.skills
          </div>
          <h2 className="text-3xl font-bold tracking-tight font-lora sm:text-5xl">
            Skills & Technologies
          </h2>
        </div>

        {/* Static Skills View: line by line, wrapping naturally */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-5xl mx-auto">
          {formattedSkills.map((skill) => (
            <div
              key={skill.id}
              className="px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xs hover:border-primary/40 hover:bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5 group cursor-default"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-background/90 border border-border/40 group-hover:scale-105 group-hover:border-primary/30 transition-transform duration-200 flex items-center justify-center shadow-2xs shrink-0">
                <TechLogo name={skill.displayName} />
              </div>

              <span className="font-semibold text-foreground text-sm sm:text-base whitespace-nowrap group-hover:text-primary transition-colors">
                {skill.displayName}
              </span>
            </div>
          ))}
        </div>

        {/* Engineering Philosophy Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-12 border-t border-border/40 text-center">
          <div className="p-4 rounded-xl space-y-2 group hover:bg-muted/30 transition-colors">
            <div className="w-11 h-11 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-bold text-sm font-lora">Algorithmic Focus</h4>
            <p className="text-xs text-muted-foreground">Optimized time & space</p>
          </div>
          <div className="p-4 rounded-xl space-y-2 group hover:bg-muted/30 transition-colors">
            <div className="w-11 h-11 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-bold text-sm font-lora">Clean Code</h4>
            <p className="text-xs text-muted-foreground">Readable & maintainable</p>
          </div>
          <div className="p-4 rounded-xl space-y-2 group hover:bg-muted/30 transition-colors">
            <div className="w-11 h-11 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-bold text-sm font-lora">Robust Systems</h4>
            <p className="text-xs text-muted-foreground">Reliable architecture</p>
          </div>
          <div className="p-4 rounded-xl space-y-2 group hover:bg-muted/30 transition-colors">
            <div className="w-11 h-11 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-bold text-sm font-lora">Deep Fundamentals</h4>
            <p className="text-xs text-muted-foreground">Lifelong learner</p>
          </div>
        </div>
      </div>
    </section>
  );
}

