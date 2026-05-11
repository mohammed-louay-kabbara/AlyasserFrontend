import React, { useState, useRef, useEffect } from "react";

interface SearchableSelectProps {
  options: Array<{ id: number; name: string }>;
  value?: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "اختر منتج",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOption, setSelectedOption] = useState<{ id: number; name: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const option = options.find((opt) => opt.id === value);
      setSelectedOption(option || null);
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: { id: number; name: string }) => {
    setSelectedOption(option);
    onChange(option.id);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    setSelectedOption(null);
    onChange(0);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "" : "text-gray-400"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        {selectedOption && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="text-gray-500 hover:text-red-500 ml-2"
          >
            ×
          </button>
        )}
        <span className="text-gray-400 ml-2">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-gray-500 text-center">لا توجد نتائج</div>
          ) : (
            <ul className="max-h-48 overflow-y-auto">
              {filteredOptions.map((option) => (
                <li
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {option.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
