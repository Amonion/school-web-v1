export interface FileType {
  type: string
  source: string
  name: string
  size: number
  duration: number
  pages: number
}

export interface Input {
  name: string
  value: string | number | null | File | Date | boolean
  rules: ValidationRules
  field: string
}

export interface ValidationRules {
  type?: 'image' | 'audio' | 'video' | 'doc'
  blank?: boolean
  minLength?: number
  maxLength?: number
  maxSize?: number
  maxTime?: number
  zero?: boolean
}
