import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import './CustomSelect.css'

function CustomSelect({ options, value, onChange, placeholder, disabled, id }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue) => {
    if (disabled) return;
    onChange(optionValue)
    setIsOpen(false)
  }

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={`custom-select ${disabled ? 'disabled' : ''}`} ref={selectRef} id={id}>
      <div 
        className={`select-trigger ${isOpen ? 'open' : ''}`} 
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`select-value ${!selectedOption ? 'placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : (placeholder || 'Select...')}
        </span>
        <ChevronDown size={16} strokeWidth={2} className="select-chevron" />
      </div>
      
      {isOpen && (
        <div className="select-dropdown animate-fade-in">
          {options.map((option) => (
            <div 
              key={option.value} 
              className={`select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomSelect
