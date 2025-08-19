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
        "px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4 text-blue-600" />}
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  )
}

export default FormHeader
