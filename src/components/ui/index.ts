// Exportaciones centralizadas de componentes UI
// NO SOBRESCRIBIR CON GENERADORES EXTERNOS
// Facilita las importaciones de componentes shadcn/ui

export { Button } from './button'
export { buttonVariants } from './button-variants'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'
export { Input } from './input'
export { Badge } from './badge'
export { badgeVariants } from './badge-variants'
export { Avatar, AvatarImage, AvatarFallback } from './avatar'

// Nota: Para añadir más componentes shadcn/ui, usar:
// npx shadcn-ui@latest add [component-name]
// 
// Componentes comunes que se pueden añadir:
// - Dialog: npx shadcn-ui@latest add dialog
// - DropdownMenu: npx shadcn-ui@latest add dropdown-menu
// - Select: npx shadcn-ui@latest add select
// - Toast: npx shadcn-ui@latest add toast 