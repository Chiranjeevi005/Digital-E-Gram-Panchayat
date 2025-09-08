import React, { useState } from 'react'

interface FormProps {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  className?: string
}

export default function Form({ children, onSubmit, className = '' }: FormProps) {
  return (
    <form 
      onSubmit={onSubmit} 
      className={`space-y-4 sm:space-y-6 ${className}`}
    >
      {children}
    </form>
  )
}

interface FormFieldProps {
  label: string
  children: React.ReactNode
  required?: boolean
  error?: string
  className?: string
  helpText?: string
  success?: string
}

Form.Field = function FormField({ label, children, required = false, error, className = '', helpText, success }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
      {error && <p className="mt-1 text-sm text-red-600 flex items-center">
        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="break-words">{error}</span>
      </p>}
      {success && <p className="mt-1 text-sm text-green-600 flex items-center">
        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="break-words">{success}</span>
      </p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  className?: string
  icon?: React.ReactNode
  success?: string
}

Form.Input = function FormInput({ error, className = '', icon, success, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`block w-full rounded-lg border bg-white px-3 py-2 sm:px-4 sm:py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 ${
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : success
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
        } ${icon ? 'pl-10' : ''} ${className}`}
      />
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  className?: string
  success?: string
}

Form.Textarea = function FormTextarea({ error, className = '', success, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`block w-full rounded-lg border bg-white px-3 py-2 sm:px-4 sm:py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 ${
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
          : success
            ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
      } ${className}`}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  className?: string
  children?: React.ReactNode
  options?: { value: string; label: string }[]
  success?: string
}

Form.Select = function FormSelect({ error, className = '', children, options, success, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`block w-full rounded-lg border bg-white px-3 py-2 sm:px-4 sm:py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 ${
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
          : success
            ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
      } ${className}`}
    >
      {options
        ? options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        : children}
    </select>
  )
}

interface RadioGroupProps {
  name: string
  options: { value: string; label: string }[]
  value?: string
  onChange: (value: string) => void
  error?: string
  className?: string
  success?: string
  required?: boolean
}

Form.RadioGroup = function FormRadioGroup({ name, options, value, onChange, error, className = '', success, required }: RadioGroupProps) {
  return (
    <div className={className}>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className="ml-3 block text-sm font-medium text-gray-700"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>}
      {success && <p className="mt-1 text-sm text-green-600 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        {success}
      </p>}
    </div>
  )
}

interface CheckboxGroupProps {
  name: string
  options: { value: string; label: string }[]
  value?: string[]
  onChange: (value: string[]) => void
  error?: string
  className?: string
  success?: string
  required?: boolean
}

Form.CheckboxGroup = function FormCheckboxGroup({ name, options, value = [], onChange, error, className = '', success, required }: CheckboxGroupProps) {
  const handleChange = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="checkbox"
              value={option.value}
              checked={value.includes(option.value)}
              onChange={() => handleChange(option.value)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className="ml-3 block text-sm font-medium text-gray-700"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>}
      {success && <p className="mt-1 text-sm text-green-600 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        {success}
      </p>}
    </div>
  )
}

interface DatePickerProps {
  error?: string
  className?: string
  value?: string
  onChange: (value: string) => void
  success?: string
  required?: boolean
}

Form.DatePicker = function FormDatePicker({ error, className = '', value, onChange, success, required, ...props }: DatePickerProps) {
  return (
    <div className="relative">
      <input
        {...props}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full rounded-lg border bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 ${
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : success
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
        } ${className}`}
      />
    </div>
  )
}

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  error?: string
  className?: string
  accept?: string
  placeholder?: string
  success?: string
}

Form.FileUpload = function FormFileUpload({ onFileSelect, error, className = '', accept, placeholder = 'Choose a file or drag and drop', success }: FileUploadProps) {
  const [fileName, setFileName] = useState('')
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileType, setFileType] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileChange = (file: File | null) => {
    onFileSelect(file)
    
    if (file) {
      setFileName(file.name)
      setFileType(file.type)
      
      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string || null)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    } else {
      setFileName('')
      setFilePreview(null)
      setFileType('')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0])
    }
  }

  return (
    <div className={className}>
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
          isDragOver 
            ? 'border-primary-500 bg-primary-50' 
            : error 
              ? 'border-red-300' 
              : success
                ? 'border-green-300'
                : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileInput}
                accept={accept}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">{placeholder}</p>
          {fileName && (
            <div className="mt-2">
              <p className="text-sm text-gray-900 flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Selected: {fileName}
              </p>
              {filePreview && (
                <div className="mt-2">
                  <img 
                    src={filePreview} 
                    alt="Preview" 
                    className="mx-auto max-h-32 rounded-md"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>}
      {success && <p className="mt-1 text-sm text-green-600 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        {success}
      </p>}
    </div>
  )
}