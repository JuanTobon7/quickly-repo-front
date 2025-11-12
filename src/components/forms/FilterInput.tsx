import { LucideIcon } from "lucide-react"
import { UseFormRegisterReturn } from "react-hook-form"

const FilterInput = ({
  label,
  register,
  placeholder,
  icon: Icon,
  iconFun
}: {
  label: string
  register: UseFormRegisterReturn
  placeholder?: string
  icon?: LucideIcon
  iconFun?: ()=> void
}) => (
  <div className="space-y-1">
    <label className="text-xs font-medium uppercase tracking-wide text-secondary">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-muted cursor-pointer"
          onClick={iconFun}
          strokeWidth={1.75}
        />
      )}
      <input
        {...register}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-border bg-white/80 px-3 py-2 text-sm text-secondary shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          Icon ? 'pr-9' : '' // 👈 añade espacio si hay ícono
        }`}
      />
    </div>
  </div>
)

export default FilterInput