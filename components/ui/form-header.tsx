import type { ReactNode } from "react"
import { FileText, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormHeaderProps {
  title: string
  icon?: LucideIcon
  children?: ReactNode
  className?: string
}

export function FormHeader({
  title,
  icon: Icon = FileText,
  children,
  className,
}: FormHeaderProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 bg-[var(--claims-form-bg)] border-b border-[var(--claims-form-border)]",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4 text-[var(--claims-form-header)]" />}
          <h3 className="text-sm font-semibold text-[var(--claims-form-header)]">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  )
}

export default FormHeader
