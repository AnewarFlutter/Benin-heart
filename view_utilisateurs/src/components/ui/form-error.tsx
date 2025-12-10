import { cn } from "@/lib/utils"

interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <p className={cn("text-sm text-red-600 dark:text-red-400 mt-1", className)}>
      {message}
    </p>
  )
}
