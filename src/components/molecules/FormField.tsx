import React from 'react'
import { Input } from '../atoms/Input'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  ...props
}) => {
  return <Input label={label} error={error} {...props} />
}

