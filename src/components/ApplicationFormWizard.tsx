'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Card from '@/components/Card'
import Form from '@/components/Form'
import ProgressBar from '@/components/ProgressBar'
import Button from '@/components/Button'

interface ServiceType {
  _id: string
  name: string
  description: string
  requirements: string[]
  processingTime: number
}

interface FormData {
  [key: string]: string | string[] | File | { url: string; publicId: string } | null
}

interface FieldValidationResult {
  isValid: boolean;
  message: string;
}

interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'select' | 'radio' | 'checkbox' | 'date' | 'file' | 'textarea'
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  helpText?: string
  defaultValue?: string | string[]
  validate?: (value: any) => FieldValidationResult
}

interface StepConfig {
  id: number
  title: string
  description: string
  fields: FieldConfig[]
}

interface ApplicationFormWizardProps {
  service: ServiceType
  onSubmit: (data: FormData) => void
  onCancel: () => void
  submitting?: boolean
  error?: string
  // Add a new prop for redirecting after submission
  onSuccessfulSubmit?: (applicationId: string) => void
}

// Define the session user type
interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role: string;
  provider?: string;
  [key: string]: any;
}

export default function ApplicationFormWizard({ 
  service, 
  onSubmit, 
  submitting = false,
  error = '',
  onSuccessfulSubmit // Add this new prop
}: Omit<ApplicationFormWizardProps, 'onCancel'>) {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({})
  const [fieldValidation, setFieldValidation] = useState<Record<string, FieldValidationResult>>({})
  
  // Define steps and fields for each service type
  const getSteps = (): StepConfig[] => {
    // Get user data from session for smart defaults
    const userData = (session?.user || {}) as SessionUser
    
    const commonFields: FieldConfig[] = [
      {
        name: 'fullName',
        label: 'Full Name',
        type: 'text',
        required: true,
        defaultValue: userData.name || '',
        placeholder: 'Enter your full name',
        validate: (value: string) => {
          if (!value?.trim()) {
            return { isValid: false, message: 'Full name is required' }
          }
          if (value.trim().length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters' }
          }
          return { isValid: true, message: 'Looks good!' }
        }
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        defaultValue: userData.email || '',
        placeholder: 'Enter your email address',
        validate: (value: string) => {
          if (!value) {
            return { isValid: false, message: 'Email is required' }
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return { isValid: false, message: 'Please enter a valid email' }
          }
          return { isValid: true, message: 'Valid email address' }
        }
      },
      {
        name: 'mobile',
        label: 'Mobile Number',
        type: 'tel',
        required: true,
        placeholder: 'Enter 10-digit mobile number',
        defaultValue: '',
        validate: (value: string) => {
          if (!value) {
            return { isValid: false, message: 'Mobile number is required' }
          }
          if (!/^\d{10}$/.test(value)) {
            return { isValid: false, message: 'Mobile number must be 10 digits' }
          }
          return { isValid: true, message: 'Valid mobile number' }
        }
      },
      {
        name: 'address',
        label: 'Address',
        type: 'textarea',
        required: true,
        placeholder: 'Enter your full address',
        validate: (value: string) => {
          if (!value?.trim()) {
            return { isValid: false, message: 'Address is required' }
          }
          if (value.trim().length < 10) {
            return { isValid: false, message: 'Please provide a complete address' }
          }
          return { isValid: true, message: '' }
        }
      }
    ]

    // Service-specific fields
    let serviceFields: FieldConfig[] = []
    
    if (service.name.includes('Birth') || service.name.includes('Death')) {
      serviceFields = [
        {
          name: 'documentType',
          label: 'Document Type',
          type: 'select',
          required: true,
          options: [
            { value: '', label: 'Select document type' },
            { value: 'birth', label: 'Birth Certificate' },
            { value: 'death', label: 'Death Certificate' }
          ],
          validate: (value: string) => {
            if (!value) {
              return { isValid: false, message: 'Document type is required' }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'dateOfEvent',
          label: 'Date of Birth/Death',
          type: 'date',
          required: true,
          validate: (value: string) => {
            if (!value) {
              return { isValid: false, message: 'Date is required' }
            }
            // Check if date is not in the future
            const selectedDate = new Date(value)
            const today = new Date()
            if (selectedDate > today) {
              return { isValid: false, message: 'Date cannot be in the future' }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'placeOfEvent',
          label: 'Place of Birth/Death',
          type: 'text',
          required: true,
          placeholder: 'Hospital/Village/City',
          validate: (value: string) => {
            if (!value?.trim()) {
              return { isValid: false, message: 'Place is required' }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'fatherName',
          label: "Father's Name",
          type: 'text',
          required: true,
          placeholder: "Enter father's full name",
          validate: (value: string) => {
            if (!value?.trim()) {
              return { isValid: false, message: "Father's name is required" }
            }
            if (value.trim().length < 2) {
              return { isValid: false, message: "Father's name must be at least 2 characters" }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'motherName',
          label: "Mother's Name",
          type: 'text',
          required: true,
          placeholder: "Enter mother's full name",
          validate: (value: string) => {
            if (!value?.trim()) {
              return { isValid: false, message: "Mother's name is required" }
            }
            if (value.trim().length < 2) {
              return { isValid: false, message: "Mother's name must be at least 2 characters" }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'supportingDocuments',
          label: 'Supporting Documents',
          type: 'file',
          required: true,
          helpText: 'Upload hospital certificate, parent ID, or other supporting documents (PDF, JPG, PNG)',
          validate: (value: File | { url: string; publicId: string } | null) => {
            if (!value) {
              return { isValid: false, message: 'Supporting documents are required' }
            }
            // Check if it's a file object or uploaded file data
            if (value instanceof File) {
              // Check file type
              const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
              if (!allowedTypes.includes(value.type)) {
                return { isValid: false, message: 'Only PDF, JPG, and PNG files are allowed' }
              }
              // Check file size (max 5MB)
              if (value.size > 5 * 1024 * 1024) {
                return { isValid: false, message: 'File size must be less than 5MB' }
              }
            } else if (typeof value === 'object' && value !== null && 'url' in value) {
              // Already uploaded file
              return { isValid: true, message: 'Document uploaded successfully' }
            } else {
              return { isValid: false, message: 'Supporting documents are required' }
            }
            return { isValid: true, message: 'Document uploaded successfully' }
          }
        }
      ]
    } else if (service.name.includes('Scheme')) {
      serviceFields = [
        {
          name: 'schemeCategory',
          label: 'Scheme Category',
          type: 'select',
          required: true,
          options: [
            { value: '', label: 'Select category' },
            { value: 'education', label: 'Education' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'employment', label: 'Employment' },
            { value: 'housing', label: 'Housing' },
            { value: 'agriculture', label: 'Agriculture' },
            { value: 'women-empowerment', label: 'Women Empowerment' }
          ],
          validate: (value: string) => {
            if (!value) {
              return { isValid: false, message: 'Scheme category is required' }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'category',
          label: 'Reservation Category',
          type: 'radio',
          required: true,
          options: [
            { value: 'general', label: 'General' },
            { value: 'obc', label: 'OBC' },
            { value: 'sc', label: 'SC' },
            { value: 'st', label: 'ST' }
          ],
          validate: (value: string) => {
            if (!value) {
              return { isValid: false, message: 'Reservation category is required' }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'annualIncome',
          label: 'Annual Income (₹)',
          type: 'select',
          required: true,
          options: [
            { value: '', label: 'Select income range' },
            { value: '0-100000', label: 'Below ₹1,00,000' },
            { value: '100000-250000', label: '₹1,00,000 - ₹2,50,000' },
            { value: '250000-500000', label: '₹2,50,000 - ₹5,00,000' },
            { value: '500000-1000000', label: '₹5,00,000 - ₹10,00,000' },
            { value: '1000000+', label: 'Above ₹10,00,000' }
          ],
          validate: (value: string) => {
            if (!value) {
              return { isValid: false, message: 'Income range is required' }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'incomeCertificate',
          label: 'Income Certificate',
          type: 'file',
          required: true,
          helpText: 'Upload income certificate (PDF, JPG, PNG)',
          validate: (value: File | { url: string; publicId: string } | null) => {
            if (!value) {
              return { isValid: false, message: 'Income certificate is required' }
            }
            // Check if it's a file object or uploaded file data
            if (value instanceof File) {
              // Check file type
              const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
              if (!allowedTypes.includes(value.type)) {
                return { isValid: false, message: 'Only PDF, JPG, and PNG files are allowed' }
              }
              // Check file size (max 5MB)
              if (value.size > 5 * 1024 * 1024) {
                return { isValid: false, message: 'File size must be less than 5MB' }
              }
            } else if (typeof value === 'object' && value !== null && 'url' in value) {
              // Already uploaded file
              return { isValid: true, message: 'Document uploaded successfully' }
            } else {
              return { isValid: false, message: 'Income certificate is required' }
            }
            return { isValid: true, message: 'Document uploaded successfully' }
          }
        },
        {
          name: 'residenceProof',
          label: 'Residence Proof',
          type: 'file',
          required: true,
          helpText: 'Upload residence proof (PDF, JPG, PNG)',
          validate: (value: File | { url: string; publicId: string } | null) => {
            if (!value) {
              return { isValid: false, message: 'Residence proof is required' }
            }
            // Check if it's a file object or uploaded file data
            if (value instanceof File) {
              // Check file type
              const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
              if (!allowedTypes.includes(value.type)) {
                return { isValid: false, message: 'Only PDF, JPG, and PNG files are allowed' }
              }
              // Check file size (max 5MB)
              if (value.size > 5 * 1024 * 1024) {
                return { isValid: false, message: 'File size must be less than 5MB' }
              }
            } else if (typeof value === 'object' && value !== null && 'url' in value) {
              // Already uploaded file
              return { isValid: true, message: 'Document uploaded successfully' }
            } else {
              return { isValid: false, message: 'Residence proof is required' }
            }
            return { isValid: true, message: 'Document uploaded successfully' }
          }
        },
        {
          name: 'casteCertificate',
          label: 'Caste Certificate (if applicable)',
          type: 'file',
          required: false,
          helpText: 'Upload caste certificate if applicable (PDF, JPG, PNG)',
          validate: (value: File | { url: string; publicId: string } | null) => {
            if (!value) {
              return { isValid: true, message: '' } // Optional field
            }
            // Check if it's a file object or uploaded file data
            if (value instanceof File) {
              // Check file type
              const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
              if (!allowedTypes.includes(value.type)) {
                return { isValid: false, message: 'Only PDF, JPG, and PNG files are allowed' }
              }
              // Check file size (max 5MB)
              if (value.size > 5 * 1024 * 1024) {
                return { isValid: false, message: 'File size must be less than 5MB' }
              }
            } else if (typeof value === 'object' && value !== null && 'url' in value) {
              // Already uploaded file
              return { isValid: true, message: 'Document uploaded successfully' }
            }
            return { isValid: true, message: 'Document uploaded successfully' }
          }
        }
      ]
    } else if (service.name.includes('Grievance')) {
      serviceFields = [
        {
          name: 'complaintCategory',
          label: 'Complaint Category',
          type: 'select',
          required: true,
          options: [
            { value: '', label: 'Select category' },
            { value: 'water', label: 'Water Supply' },
            { value: 'electricity', label: 'Electricity' },
            { value: 'roads', label: 'Roads/Infrastructure' },
            { value: 'sanitation', label: 'Sanitation' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'education', label: 'Education' },
            { value: 'other', label: 'Other' }
          ],
          validate: (value: string) => {
            if (!value) {
              return { isValid: false, message: 'Complaint category is required' }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'complaintDescription',
          label: 'Complaint Description',
          type: 'textarea',
          required: true,
          placeholder: 'Describe your complaint in detail',
          helpText: 'Be specific about the issue and location',
          validate: (value: string) => {
            if (!value?.trim()) {
              return { isValid: false, message: 'Complaint description is required' }
            }
            if (value.trim().length < 20) {
              return { isValid: false, message: 'Please provide more details about your complaint (at least 20 characters)' }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'location',
          label: 'Location/Area',
          type: 'text',
          required: true,
          placeholder: 'Village/Ward/Area name',
          validate: (value: string) => {
            if (!value?.trim()) {
              return { isValid: false, message: 'Location is required' }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'supportingDocuments',
          label: 'Supporting Documents (Optional)',
          type: 'file',
          required: false,
          helpText: 'Upload photos or documents related to your complaint (PDF, JPG, PNG)',
          validate: (value: File | { url: string; publicId: string } | null) => {
            if (!value) {
              return { isValid: true, message: '' } // Optional field
            }
            // Check if it's a file object or uploaded file data
            if (value instanceof File) {
              // Check file type
              const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
              if (!allowedTypes.includes(value.type)) {
                return { isValid: false, message: 'Only PDF, JPG, and PNG files are allowed' }
              }
              // Check file size (max 5MB)
              if (value.size > 5 * 1024 * 1024) {
                return { isValid: false, message: 'File size must be less than 5MB' }
              }
            } else if (typeof value === 'object' && value !== null && 'url' in value) {
              // Already uploaded file
              return { isValid: true, message: 'Document uploaded successfully' }
            }
            return { isValid: true, message: 'Document uploaded successfully' }
          }
        }
      ]
    } else if (service.name.includes('Land') || service.name.includes('Utility')) {
      serviceFields = [
        {
          name: 'serviceType',
          label: 'Service Type',
          type: 'radio',
          required: true,
          options: [
            { value: 'landRecord', label: 'Land Record' },
            { value: 'utility', label: 'Utility Connection' }
          ],
          validate: (value: string) => {
            if (!value) {
              return { isValid: false, message: 'Service type is required' }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'propertyDetails',
          label: 'Property Details',
          type: 'textarea',
          required: true,
          placeholder: 'Survey number, address, or other identifying details',
          validate: (value: string) => {
            if (!value?.trim()) {
              return { isValid: false, message: 'Property details are required' }
            }
            return { isValid: true, message: '' }
          }
        },
        {
          name: 'landDocuments',
          label: 'Land Ownership Documents',
          type: 'file',
          required: true,
          helpText: 'Upload property documents (PDF, JPG, PNG)',
          validate: (value: File | { url: string; publicId: string } | null) => {
            if (!value) {
              return { isValid: false, message: 'Land ownership documents are required' }
            }
            // Check if it's a file object or uploaded file data
            if (value instanceof File) {
              // Check file type
              const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
              if (!allowedTypes.includes(value.type)) {
                return { isValid: false, message: 'Only PDF, JPG, and PNG files are allowed' }
              }
              // Check file size (max 5MB)
              if (value.size > 5 * 1024 * 1024) {
                return { isValid: false, message: 'File size must be less than 5MB' }
              }
            } else if (typeof value === 'object' && value !== null && 'url' in value) {
              // Already uploaded file
              return { isValid: true, message: 'Document uploaded successfully' }
            } else {
              return { isValid: false, message: 'Land ownership documents are required' }
            }
            return { isValid: true, message: 'Document uploaded successfully' }
          }
        },
        {
          name: 'utilityType',
          label: 'Utility Type (if applicable)',
          type: 'checkbox',
          options: [
            { value: 'electricity', label: 'Electricity' },
            { value: 'water', label: 'Water' },
            { value: 'sanitation', label: 'Sanitation' }
          ],
          validate: (value: string[]) => {
            // This field is optional, so always valid
            return { isValid: true, message: '' }
          }
        }
      ]
    }

    return [
      {
        id: 1,
        title: 'Personal Information',
        description: 'Basic details required for all applications',
        fields: commonFields
      },
      {
        id: 2,
        title: 'Service Details',
        description: `Specific information for ${service.name}`,
        fields: serviceFields
      },
      {
        id: 3,
        title: 'Review & Submit',
        description: 'Verify your information before submission',
        fields: []
      }
    ]
  }

  const steps = getSteps()
  const currentStepConfig = steps.find(step => step.id === currentStep) || steps[0]
  const totalSteps = steps.length

  // Initialize form data with default values
  useEffect(() => {
    const initialData: FormData = {}
    steps.forEach(step => {
      step.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue
        } else {
          initialData[field.name] = field.type === 'checkbox' ? [] : ''
        }
      })
    })
    setFormData(initialData)
  }, [service._id])

  // Handle file upload
  const handleFileUpload = async (file: File | null, fieldName: string) => {
    if (!file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: null
      }))
      return
    }
    
    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      formDataObj.append('fieldName', fieldName)
      formDataObj.append('applicationId', `temp_${Date.now()}`) // Temporary ID until application is created
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'File upload failed')
      }
      
      const result = await response.json()
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: {
          url: result.url,
          publicId: result.publicId
        }
      }))
    } catch (error) {
      console.error('File upload error:', error)
      // Show error notification to user
      const errorMessage = error instanceof Error ? error.message : 'File upload failed. Please try again.'
      // Use the showNotification function to display the error
      const { showNotification } = await import('@/lib/documentGenerator')
      showNotification(`Upload Error: ${errorMessage}`)
    }
  }
  
  // Validate field when it changes
  const validateField = (fieldName: string, value: any) => {
    const step = steps.find(s => s.fields.some(f => f.name === fieldName))
    if (!step) return
    
    const field = step.fields.find(f => f.name === fieldName)
    if (!field || !field.validate) return
    
    const validationResult = field.validate(value)
    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: validationResult
    }))
  }

  const handleInputChange = (name: string, value: string | string[] | File | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Validate the field
    validateField(name, value)
  }

  const validateStep = (stepId: number) => {
    const step = steps.find(s => s.id === stepId)
    if (!step) return true
    
    let isValid = true
    const newValidation: Record<string, FieldValidationResult> = {}
    
    step.fields.forEach(field => {
      const value = formData[field.name]
      
      // Required field validation
      if (field.required) {
        if (
          value === undefined || 
          value === null || 
          value === '' || 
          (Array.isArray(value) && value.length === 0) ||
          (field.type === 'file' && (value === null || (typeof value === 'object' && value !== null && !('url' in value))))
        ) {
          newValidation[field.name] = { isValid: false, message: `${field.label} is required` }
          isValid = false
          return
        }
      }
      
      // Custom validation
      if (field.validate) {
        const validationResult = field.validate(value)
        newValidation[field.name] = validationResult
        if (!validationResult.isValid) {
          isValid = false
        }
      }
    })
    
    setFieldValidation(prev => ({ ...prev, ...newValidation }))
    return isValid
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep(currentStep)) {
      // Instead of calling onSubmit directly, we'll handle the submission here
      try {
        console.log('Submitting application data:', {
          service: service._id,
          formData
        });
        
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service: service._id,
            formData
          }),
        })
        
        console.log('API Response Status:', response.status);
        console.log('API Response Status Text:', response.statusText);
        // Fixed the headers logging to avoid TypeScript error
        const headersObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
        console.log('API Response Headers:', headersObj);
        
        if (response.ok) {
          const application = await response.json()
          // If onSuccessfulSubmit is provided, call it with the application ID
          if (onSuccessfulSubmit) {
            onSuccessfulSubmit(application._id)
          } else {
            // Fallback to the original onSubmit
            onSubmit(formData)
          }
        } else {
          // Handle error with more detailed information
          let errorData;
          try {
            const textResponse = await response.text();
            console.log('Raw error response:', textResponse);
          
            // Try to parse as JSON, but handle if it's not valid JSON
            try {
              errorData = JSON.parse(textResponse);
            } catch (parseError) {
              // If JSON parsing fails, create an error object with the text
              errorData = {
                message: textResponse || response.statusText || 'Unknown error occurred',
                status: response.status
              }
            }
          } catch (parseError) {
            // If getting text fails, use the status text
            errorData = {
              message: response.statusText || 'Unknown error occurred',
              status: response.status
            }
          }
        
          // Show error notification to user
          const errorMessage = errorData.error || errorData.message || 'Application submission failed'
          const { showNotification } = await import('@/lib/documentGenerator')
          showNotification(`Submission Error: ${errorMessage}`)
        
          // Log detailed error information
          console.error('Submission error:', {
            status: response.status,
            statusText: response.statusText,
            errorData: errorData
          })
        }
      } catch (error) {
        // Handle network errors or other exceptions
        const errorMessage = error instanceof Error ? error.message : 'Network error or unknown issue'
        const { showNotification } = await import('@/lib/documentGenerator')
        showNotification(`Submission Error: ${errorMessage}`)
      
        console.error('Submission error:', {
          name: error instanceof Error ? error.name : 'Unknown error',
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        })
      }
    }
  }

  const renderField = (field: FieldConfig) => {
    const value = formData[field.name]
    const validation = fieldValidation[field.name]
    
    const error = validation && !validation.isValid ? validation.message : undefined
    const success = validation && validation.isValid && validation.message ? validation.message : undefined
    
    switch (field.type) {
      case 'select':
        return (
          <Form.Select
            value={value as string || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            options={field.options || []}
            error={error}
            success={success}
            required={field.required}
          />
        )
      
      case 'radio':
        return (
          <Form.RadioGroup
            name={field.name}
            options={field.options || []}
            value={value as string || ''}
            onChange={(val) => handleInputChange(field.name, val)}
            error={error}
            success={success}
          />
        )
      
      case 'checkbox':
        return (
          <Form.CheckboxGroup
            name={field.name}
            options={field.options || []}
            value={value as string[] || []}
            onChange={(val) => handleInputChange(field.name, val)}
            error={error}
            success={success}
          />
        )
      
      case 'date':
        return (
          <Form.DatePicker
            value={value as string || ''}
            onChange={(val) => handleInputChange(field.name, val)}
            error={error}
            success={success}
          />
        )
      
      case 'file':
        // Check if we have an uploaded file
        const uploadedFile = formData[field.name] as { url: string; publicId: string } | null;
        
        return (
          <div>
            <Form.FileUpload
              onFileSelect={(file) => handleFileUpload(file, field.name)}
              accept="image/jpeg,image/png,application/pdf"
              placeholder={field.placeholder || "Upload JPEG, PNG, or PDF (max 5MB)"}
              error={fieldValidation[field.name]?.isValid === false ? fieldValidation[field.name].message : undefined}
            />
            {uploadedFile && uploadedFile.url && (
              <div className="mt-2">
                {uploadedFile.url.endsWith('.pdf') ? (
                  <div className="flex items-center p-2 bg-gray-50 rounded">
                    <svg className="w-6 h-6 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Uploaded PDF</span>
                    <a 
                      href={uploadedFile.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View File
                    </a>
                  </div>
                ) : (
                  <div className="mt-2">
                    <img 
                      src={uploadedFile.url} 
                      alt="Uploaded document" 
                      className="max-h-40 rounded border"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )
      
      case 'textarea':
        return (
          <Form.Textarea
            value={value as string || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            error={error}
            success={success}
            required={field.required}
            placeholder={field.placeholder}
            rows={3}
          />
        )
      
      default:
        return (
          <Form.Input
            type={field.type}
            value={value as string || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            error={error}
            success={success}
            required={field.required}
            placeholder={field.placeholder}
          />
        )
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
          Apply for {service.name}
        </h2>
        <p className="text-neutral-600">
          Complete this form in 3 quick steps
        </p>
      </div>
      
      <ProgressBar 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        className="mb-8"
      />
      
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold text-neutral-900">
          {currentStepConfig.title}
        </h3>
        <p className="text-neutral-600 text-sm">
          {currentStepConfig.description}
        </p>
      </div>
      
      {currentStep < totalSteps ? (
        <Form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {currentStepConfig.fields.map((field) => (
              <Form.Field
                key={field.name}
                label={field.label}
                required={field.required}
                error={fieldValidation[field.name] && !fieldValidation[field.name].isValid ? fieldValidation[field.name].message : undefined}
                success={fieldValidation[field.name] && fieldValidation[field.name].isValid && fieldValidation[field.name].message ? fieldValidation[field.name].message : undefined}
                helpText={field.helpText}
              >
                {renderField(field)}
              </Form.Field>
            ))}
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm"
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (currentStep === totalSteps - 1) {
                  // Create a mock form event for handleSubmit
                  const mockEvent = { preventDefault: () => {} } as React.FormEvent;
                  handleSubmit(mockEvent);
                } else {
                  handleNext();
                }
              }}
              disabled={submitting}
              className="px-4 py-2 text-sm"
            >
              {currentStep === totalSteps - 1 
                ? (submitting ? 'Submitting...' : 'Submit Application') 
                : 'Continue'}
            </Button>
          </div>
        </Form>
      ) : (
        // Review step
        <div>
          <div className="bg-neutral-50 rounded-lg p-6 mb-6">
            <h4 className="font-heading font-semibold text-neutral-900 mb-4">
              Application Summary
            </h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-neutral-700 mb-2">
                  Personal Information
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-neutral-500">Full Name</p>
                    <p className="text-neutral-900">{formData.fullName as string}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Email</p>
                    <p className="text-neutral-900">{formData.email as string}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Mobile</p>
                    <p className="text-neutral-900">{formData.mobile as string}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Address</p>
                    <p className="text-neutral-900">{formData.address as string}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-neutral-700 mb-2">
                  Service Details
                </h5>
                <div className="space-y-2">
                  {Object.entries(formData)
                    .filter(([key]) => !['fullName', 'email', 'mobile', 'address'].includes(key))
                    .map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-neutral-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-neutral-900">
                          {Array.isArray(value) 
                            ? value.join(', ') 
                            : value instanceof File 
                              ? value.name 
                              : typeof value === 'object' && value !== null && 'url' in value
                                ? 'File uploaded'
                                : value || 'Not provided'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={handlePrev}
              className="px-4 py-2 text-sm"
            >
              Back
            </Button>
            <Button
              onClick={() => onSubmit(formData)}
              disabled={submitting}
              className="px-4 py-2 text-sm"
            >
              {submitting ? 'Submitting...' : 'Confirm & Submit'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}