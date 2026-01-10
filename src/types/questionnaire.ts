/**
 * Flexible questionnaire types that support Typeform JSON structure
 * and allow for customization per law firm
 */

// Field types supported
export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'number'
  | 'phone_number'
  | 'date'
  | 'multiple_choice'
  | 'yes_no'
  | 'dropdown'
  | 'statement'
  | 'file_upload'
  | 'rating'
  | 'opinion_scale'
  | 'picture_choice'

// Choice option for multiple choice questions
export interface Choice {
  id: string
  ref?: string
  label: string
}

// Field validation rules
export interface FieldValidations {
  required?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  min?: number
  max?: number
}

// Field properties (varies by field type)
export interface FieldProperties {
  description?: string
  button_text?: string
  hide_marks?: boolean
  randomize?: boolean
  allow_multiple_selection?: boolean
  allow_other_choice?: boolean
  vertical_alignment?: boolean
  choices?: Choice[]
  steps?: number // For rating/scale questions
  start_at_one?: boolean
  labels?: {
    left?: string
    right?: string
    center?: string
  }
}

// Base field structure
export interface Field {
  id: string
  ref: string
  title: string
  type: FieldType
  properties?: FieldProperties
  validations?: FieldValidations
}

// Welcome screen
export interface WelcomeScreen {
  id: string
  ref: string
  title: string
  properties?: {
    show_button?: boolean
    button_text?: string
    description?: string
    attachment?: {
      type: string
      href: string
    }
  }
}

// Thank you screen
export interface ThankYouScreen {
  id: string
  ref: string
  title: string
  properties?: {
    show_button?: boolean
    button_text?: string
    button_mode?: 'reload' | 'redirect' | 'default_redirect'
    share_icons?: boolean
    attachment?: {
      type: string
      href: string
    }
  }
}

// Logic condition types
export type LogicOperator = 'is' | 'is_not' | 'greater' | 'less' | 'contains' | 'not_contains' | 'always'
export type LogicCombiner = 'and' | 'or'

// Logic condition
export interface LogicCondition {
  op: LogicOperator | LogicCombiner
  vars: LogicVar[]
}

// Logic variable (field reference or choice reference)
export interface LogicVar {
  type: 'field' | 'choice' | 'variable'
  value: string
}

// Logic action (jump to field/screen)
export interface LogicAction {
  action: 'jump'
  details: {
    to: {
      type: 'field' | 'screen'
      value: string
    }
  }
  condition: LogicCondition
}

// Logic rule for a field
export interface Logic {
  type: 'field' | 'screen'
  ref: string
  actions: LogicAction[]
}

// Branding configuration
export interface Branding {
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  favicon?: string
  firmName?: string
}

// Complete questionnaire configuration
export interface QuestionnaireConfig {
  id?: string
  title: string
  description?: string
  language?: string
  fields: Field[]
  welcome_screens?: WelcomeScreen[]
  thankyou_screens?: ThankYouScreen[]
  logic?: Logic[]
  settings?: {
    progress_bar?: 'proportion' | 'percentage' | 'off'
    show_progress_bar?: boolean
    show_question_number?: boolean
    show_typeform_branding?: boolean
    hide_navigation?: boolean
    [key: string]: any // Allow additional settings
  }
  // Allow for additional custom properties per firm
  [key: string]: any
}

// Parsed questionnaire (internal format)
export interface ParsedQuestionnaire {
  id: string
  subdomain: string
  title: string
  description?: string
  config: QuestionnaireConfig
  lawFirmEmail: string
  lawFirmName: string
  branding?: Branding
  isActive: boolean
}

// Response answer structure (flexible)
export type AnswerValue = string | number | boolean | string[] | File | null

export interface ResponseAnswers {
  [fieldRef: string]: AnswerValue
}

// Response metadata
export interface ResponseMetadata {
  ipAddress?: string
  userAgent?: string
  referrer?: string
  startedAt?: string
  completedAt?: string
  timeSpent?: number // in seconds
  [key: string]: any // Allow additional metadata
}
