import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption<T = any> {
  label: string;
  value: T;
}

interface Props<T = any> {
  options: DropdownOption<T>[];
  label: string;
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function GenericDropdown<T>({
  options,
  value,
  onChange,
  label,
  placeholder = "Seleccionar...",
  disabled = false,
}: Props<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Generar un ID único para este dropdown
  const dropdownId = React.useId();

  // Cerrar dropdown al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
        setIsTyping(false);
        setSearchTerm("");
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSelect = (val: T) => {
    onChange(val);
    setOpen(false);
    setSearchTerm("");
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsTyping(true);
    if (!open) setOpen(true);
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, searchTerm]);

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const displayValue = isTyping ? searchTerm : (selectedLabel ?? "");

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label htmlFor={dropdownId} className="text-xs font-medium uppercase tracking-wide text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={dropdownId}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full flex-1 rounded-lg border border-border bg-white/80 px-3 py-2 text-sm text-secondary shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
      </div>

      {open && (
        <div className="absolute mt-1 w-full rounded-md border border-border bg-white shadow-md z-10 max-h-[200px] overflow-y-auto">
          {filteredOptions?.length ? (
            filteredOptions.map((option) => (
              <div
                key={String(option.value)}
                className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted">No hay opciones disponibles</div>
          )}
        </div>

      )}
    </div>
  );
}
