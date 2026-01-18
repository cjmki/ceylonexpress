'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface CustomSelectProps {
  id: string
  name: string
  value: string
  onChange: (e: { target: { name: string; value: string } }) => void
  options: Option[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export default function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = ''
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const selectedOption = options.find(opt => opt.value === value)
  const displayText = selectedOption?.label || placeholder

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const enabledOptions = options.filter(opt => !opt.disabled)
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex(prev => {
            const currentOptionIndex = options.findIndex((_, idx) => idx === prev)
            const nextIndex = options.findIndex((opt, idx) => 
              idx > prev && !opt.disabled
            )
            return nextIndex === -1 ? prev : nextIndex
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex(prev => {
            const prevIndex = [...options].reverse().findIndex((opt, idx) => 
              options.length - 1 - idx < prev && !opt.disabled
            )
            return prevIndex === -1 ? prev : options.length - 1 - prevIndex
          })
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (highlightedIndex >= 0 && !options[highlightedIndex].disabled) {
            handleSelect(options[highlightedIndex].value)
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          buttonRef.current?.focus()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, highlightedIndex, options])

  const handleSelect = (selectedValue: string) => {
    onChange({ target: { name, value: selectedValue } })
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Hidden select for form validation */}
      <select
        id={id}
        name={name}
        value={value}
        required={required}
        className="absolute opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
        onChange={() => {}}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom styled button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full p-4 border-2 border-ceylon-text/20 focus:border-ceylon-orange focus:outline-none focus:ring-4 focus:ring-ceylon-orange/20 transition-all duration-300 bg-white hover:border-ceylon-orange/40 rounded-xl shadow-md hover:shadow-lg text-body-lg font-medium text-left flex items-center justify-between group
          ${disabled ? 'bg-ceylon-text/5 cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${!value ? 'text-ceylon-text/50' : 'text-ceylon-text'}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{displayText}</span>
        <div className="bg-ceylon-orange/10 group-hover:bg-ceylon-orange/20 transition-colors rounded-lg p-1.5 ml-2 flex-shrink-0">
          <ChevronDown 
            className={`h-5 w-5 text-ceylon-orange transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-2 bg-white border-2 border-ceylon-orange/40 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
        >
          <div className="max-h-64 overflow-y-auto py-2 custom-scrollbar-thin">
            {options.map((option, index) => {
              const isSelected = option.value === value
              const isHighlighted = index === highlightedIndex
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  disabled={option.disabled}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-150 text-body-lg font-medium
                    ${option.disabled 
                      ? 'text-ceylon-text/30 cursor-not-allowed bg-ceylon-text/5' 
                      : isSelected
                        ? 'bg-ceylon-orange text-white'
                        : isHighlighted
                          ? 'bg-ceylon-yellow/30 text-ceylon-text'
                          : 'text-ceylon-text hover:bg-ceylon-yellow/20'
                    }
                  `}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="h-5 w-5 ml-2 flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
