import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SourceSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { value: "hollywood", label: "Vglist - Hollywood" },
    { value: "bollywood", label: "Vglist - Bollywood" },
    { value: "moviesnation", label: "MoviesNation" },
  ];

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative shrink-0 w-full md:w-auto z-50" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full md:w-[220px] flex items-center justify-between bg-[#030705] border border-emerald-900/50 rounded-xl px-4 py-3 md:py-2.5 text-sm font-bold text-emerald-400 focus:outline-none transition-all shadow-inner",
          isOpen
            ? "ring-2 ring-emerald-500/50 border-transparent"
            : "hover:border-emerald-500/50",
        )}
      >
        <span className="truncate text-left">{selectedOption.label}</span>
        <Icon
          icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
          className="text-emerald-500 text-lg ml-2 shrink-0"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-[#08110b] border border-emerald-900/50 rounded-xl shadow-2xl overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm font-semibold transition-colors",
                  value === option.value
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-emerald-100/70 hover:bg-emerald-900/30 hover:text-emerald-200",
                )}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
