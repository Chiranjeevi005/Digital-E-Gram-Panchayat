import React, { ReactNode } from 'react'

interface FormProps {
  children: ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
}

interface FieldProps {
  children: ReactNode
  label?: string
  required?: boolean
  error?: string
  success?: string
  helpText?: string
  className?: string
}

interface InputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
  error?: string
  success?: string
  required?: boolean
  className?: string
  min?: string
  max?: string
}

interface TextareaProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  error?: string
  success?: string
  required?: boolean
  rows?: number
  className?: string
}

interface SelectProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  error?: string
  success?: string
  required?: boolean
  className?: string
}

interface RadioGroupProps {
  name: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  error?: string
  success?: string
  className?: string
}

interface CheckboxGroupProps {
  name: string
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  success?: string
  className?: string
}

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  error?: string
  success?: string
  className?: string
}

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  placeholder?: string
  error?: string
  className?: string
}

const Form = ({ children, onSubmit, className = '' }: FormProps) => {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  )
}

const Field = ({ 
  children, 
  label, 
  required, 
  error, 
  success, 
  helpText,
  className = '' 
}: FieldProps) => {
  return (
    <div className={`mb-3 sm:mb-4 ${className}`}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {children}
      </div>
      {error && (
        <p className="mt-1 text-[0.6rem] sm:text-xs text-red-600">{error}</p>
      )}
      {success && (
        <p className="mt-1 text-[0.6rem] sm:text-xs text-green-600">{success}</p>
      )}
      {helpText && (
        <p className="mt-1 text-[0.6rem] sm:text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

const Input = ({ 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  error, 
  success, 
  required, 
  className = '',
  min,
  max
}: InputProps) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      min={min}
      max={max}
      className={`block w-full rounded-md border ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
        success ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 
        'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
      } bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 ${className}`}
    />
  )
}

const Textarea = ({ 
  value, 
  onChange, 
  placeholder, 
  error, 
  success, 
  required, 
  rows = 3, 
  className = '' 
}: TextareaProps) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      rows={rows}
      className={`block w-full rounded-md border ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
        success ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 
        'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
      } bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 ${className}`}
    />
  )
}

const Select = ({ 
  value, 
  onChange, 
  options, 
  error, 
  success, 
  required, 
  className = '' 
}: SelectProps) => {
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={`block w-full rounded-md border ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
        success ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 
        'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
      } bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 ${className}`}
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

const RadioGroup = ({ 
  name, 
  options, 
  value, 
  onChange, 
  error, 
  success, 
  className = '' 
}: RadioGroupProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            id={`${name}-${option.value}`}
            name={name}
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className={`h-3 w-3 sm:h-4 sm:w-4 ${
              error ? 'border-red-300 text-red-600 focus:ring-red-500' : 
              success ? 'border-green-300 text-green-600 focus:ring-green-500' : 
              'border-gray-300 text-indigo-600 focus:ring-indigo-500'
            } focus:ring-1`}
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="ml-2 sm:ml-3 block text-xs sm:text-sm font-medium text-gray-700"
          >
            {option.label}
          </label>
        </div>
      ))}
      {error && (
        <p className="mt-1 text-[0.6rem] sm:text-xs text-red-600">{error}</p>
      )}
      {success && (
        <p className="mt-1 text-[0.6rem] sm:text-xs text-green-600">{success}</p>
      )}
    </div>
  )
}

const CheckboxGroup = ({ 
  name, 
  options, 
  value, 
  onChange, 
  error, 
  success, 
  className = '' 
}: CheckboxGroupProps) => {
  const handleChange = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            id={`${name}-${option.value}`}
            name={name}
            type="checkbox"
            value={option.value}
            checked={value.includes(option.value)}
            onChange={() => handleChange(option.value)}
            className={`h-3 w-3 sm:h-4 sm:w-4 ${
              error ? 'border-red-300 text-red-600 focus:ring-red-500' : 
              success ? 'border-green-300 text-green-600 focus:ring-green-500' : 
              'border-gray-300 text-indigo-600 focus:ring-indigo-500'
            } rounded focus:ring-1`}
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="ml-2 sm:ml-3 block text-xs sm:text-sm font-medium text-gray-700"
          >
            {option.label}
          </label>
        </div>
      ))}
      {error && (
        <p className="mt-1 text-[0.6rem] sm:text-xs text-red-600">{error}</p>
      )}
      {success && (
        <p className="mt-1 text-[0.6rem] sm:text-xs text-green-600">{success}</p>
      )}
    </div>
  )
}

const DatePicker = ({ 
  value, 
  onChange, 
  error, 
  success, 
  className = '' 
}: DatePickerProps) => {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full rounded-md border ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
        success ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 
        'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
      } bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 ${className}`}
    />
  )
}

const FileUpload = ({ 
  onFileSelect, 
  accept = 'image/*', 
  placeholder = 'Choose a file', 
  error, 
  className = '' 
}: FileUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0])
    }
  }

  return (
    <div className={className}>
      <label className="block">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="sr-only"
        />
        <div className={`block w-full rounded-md border ${
          error ? 'border-red-300' : 'border-gray-300'
        } bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}>
          {placeholder}
        </div>
      </label>
      {error && (
        <p className="mt-1 text-[0.6rem] sm:text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

Form.Field = Field
Form.Input = Input
Form.Textarea = Textarea
Form.Select = Select
Form.RadioGroup = RadioGroup
Form.CheckboxGroup = CheckboxGroup
Form.DatePicker = DatePicker
Form.FileUpload = FileUpload

export default Form