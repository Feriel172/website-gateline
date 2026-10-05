"use client"

import { addMonths, format, subMonths } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MonthPickerProps {
  month: Date
  onChange: (month: Date) => void
}

// ‹ Septembre 2026 › — the one control used to scope the admin pages to a month
export function MonthPicker({ month, onChange }: MonthPickerProps) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <Button variant="ghost" size="sm" onClick={() => onChange(subMonths(month, 1))} aria-label="Mois précédent">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm font-medium capitalize min-w-[8.5rem] text-center">
        {format(month, "LLLL yyyy", { locale: fr })}
      </span>
      <Button variant="ghost" size="sm" onClick={() => onChange(addMonths(month, 1))} aria-label="Mois suivant">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
