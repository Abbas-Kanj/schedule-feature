import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import {
  createPredefinedHolidays,
  publicHolidays as initialHolidays,
} from '../data/public-holiday'
import { type HolidayYear, type PublicHoliday } from '../data/schema'

type PublicHolidayDialogType = 'add' | 'edit' | 'delete'

type PublicHolidayContextType = {
  open: PublicHolidayDialogType | null
  setOpen: (value: PublicHolidayDialogType | null) => void
  currentRow: PublicHoliday | null
  setCurrentRow: React.Dispatch<React.SetStateAction<PublicHoliday | null>>
  holidays: PublicHoliday[]
  years: HolidayYear[]
  selectedYear: number
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>
  openYear: () => void
  saveHoliday: (holiday: PublicHoliday) => void
  deleteHoliday: (id: string) => void
}

const PublicHolidayContext =
  React.createContext<PublicHolidayContextType | null>(null)

export function PublicHolidayProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<PublicHolidayDialogType>(null)
  const [currentRow, setCurrentRow] = useState<PublicHoliday | null>(null)
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [years, setYears] = useState<HolidayYear[]>(
    Array.from({ length: 5 }, (_, index) => ({
      year: currentYear + 4 - index,
      isOpen: currentYear + 4 - index === currentYear,
    }))
  )
  const [holidays, setHolidays] =
    useState<PublicHoliday[]>(initialHolidays)

  const openYear = () => {
    const selected = years.find((item) => item.year === selectedYear)
    if (!selected || selected.isOpen) return

    setHolidays((current) => [
      ...current,
      ...createPredefinedHolidays(selectedYear),
    ])
    setYears((current) =>
      current.map((item) =>
        item.year === selectedYear ? { ...item, isOpen: true } : item
      )
    )
  }

  const saveHoliday = (holiday: PublicHoliday) => {
    setHolidays((current) => {
      const exists = current.some((item) => item.id === holiday.id)
      return exists
        ? current.map((item) => (item.id === holiday.id ? holiday : item))
        : [...current, holiday]
    })
  }

  const deleteHoliday = (id: string) => {
    setHolidays((current) => current.filter((item) => item.id !== id))
  }

  return (
    <PublicHolidayContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        holidays,
        years,
        selectedYear,
        setSelectedYear,
        openYear,
        saveHoliday,
        deleteHoliday,
      }}
    >
      {children}
    </PublicHolidayContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePublicHoliday = () => {
  const context = React.useContext(PublicHolidayContext)
  if (!context) {
    throw new Error(
      'usePublicHoliday must be used within <PublicHolidayProvider>'
    )
  }
  return context
}
