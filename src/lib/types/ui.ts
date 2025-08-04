/**
 * Tipos TypeScript estrictos para componentes UI
 */

import type { Snippet } from 'svelte';

// Tipos base para elementos
export interface BaseProps {
  class?: string;
  children?: Snippet;
  [key: string]: unknown;
}

// Button Component Types
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
}

// Alert Component Types
export type AlertVariant = 'default' | 'destructive';

export interface AlertProps extends BaseProps {
  variant?: AlertVariant;
}

export interface AlertTitleProps extends BaseProps {}

export interface AlertDescriptionProps extends BaseProps {}

// Badge Component Types
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface BadgeProps extends BaseProps {
  variant?: BadgeVariant;
}

// Card Component Types
export interface CardProps extends BaseProps {}

export interface CardHeaderProps extends BaseProps {}

export interface CardTitleProps extends BaseProps {}

export interface CardDescriptionProps extends BaseProps {}

export interface CardContentProps extends BaseProps {}

export interface CardFooterProps extends BaseProps {}

export interface CardActionProps extends BaseProps {}

// Dialog Component Types
export interface DialogProps extends BaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DialogTriggerProps extends BaseProps {}

export interface DialogContentProps extends BaseProps {}

export interface DialogHeaderProps extends BaseProps {}

export interface DialogTitleProps extends BaseProps {}

export interface DialogDescriptionProps extends BaseProps {}

export interface DialogFooterProps extends BaseProps {}

export interface DialogOverlayProps extends BaseProps {}

export interface DialogCloseProps extends BaseProps {}

// Input Component Types
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

export interface InputProps extends BaseProps {
  type?: InputType;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autocomplete?: string;
}

// Avatar Component Types
export interface AvatarProps extends BaseProps {}

export interface AvatarImageProps extends BaseProps {
  src?: string;
  alt?: string;
}

export interface AvatarFallbackProps extends BaseProps {}

// Utilidad para combinar clases CSS
export type ClassValue = string | number | boolean | undefined | null | ClassValue[];
