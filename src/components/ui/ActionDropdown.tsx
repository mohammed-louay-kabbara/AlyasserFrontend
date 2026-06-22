import React, { useState, useRef, useEffect, KeyboardEvent } from "react";

export interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionDropdownProps {
  actions: ActionItem[];
  trigger?: React.ReactNode;
  align?: "left" | "right";
  size?: "sm" | "md" | "lg";
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  actions,
  trigger,
  align = "left",
  size = "sm"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleActionClick = (action: ActionItem) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };

  const iconSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const menuAlignClasses = {
    left: "left-0",
    right: "right-0"
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger || (
          <svg
            className={`${iconSizeClasses[size]} text-gray-600`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 ${menuAlignClasses[align]} mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-200 ease-in-out origin-top`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
          onKeyDown={handleKeyDown}
        >
          <div className="py-1" role="none">
            {actions.map((action: ActionItem, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={`w-full text-right px-4 py-2 text-sm flex items-center gap-3 gap-x-reverse transition-colors duration-150 ${
                  action.danger
                    ? "text-red-600 hover:bg-red-50 focus:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50 focus:bg-gray-50"
                } ${action.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} focus:outline-none`}
                role="menuitem"
                tabIndex={index === 0 ? 0 : -1}
              >
                {action.icon && (
                  <span className="flex-shrink-0">{action.icon}</span>
                )}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
