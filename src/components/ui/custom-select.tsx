'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção...',
  icon: LeftIcon,
  disabled = false,
  className = '',
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fechar no ESC
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Botão Gatilho (Trigger) */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between text-left transition-all duration-150 rounded-xl border bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs font-semibold text-gray-800 dark:text-neutral-200 shadow-2xs ${
          isOpen
            ? 'border-[#e30613] ring-2 ring-red-500/20'
            : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 truncate pr-2">
          {LeftIcon && (
            <LeftIcon className="w-4 h-4 text-gray-400 dark:text-neutral-500 shrink-0" />
          )}
          {selectedOption ? (
            <span className="truncate flex items-center gap-2">
              {selectedOption.icon && <selectedOption.icon className="w-3.5 h-3.5 text-gray-400" />}
              <span>{selectedOption.label}</span>
            </span>
          ) : (
            <span className="text-gray-400 dark:text-neutral-500 truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 dark:text-neutral-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#e30613]' : ''
          }`}
        />
      </button>

      {/* Popover Flutuante Customizado */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400 dark:text-neutral-500 text-center">
              Nenhuma opção disponível
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
                    isSelected
                      ? 'bg-red-50 dark:bg-red-950/50 text-[#e30613] font-bold'
                      : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {OptionIcon && (
                      <OptionIcon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-[#e30613]' : 'text-gray-400'
                        }`}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-[#e30613] shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
