import { create } from 'zustand'
import { defaultSchedules } from '../data/schedules'
import { type Schedule } from '../data/schema'

const STORAGE_KEY = 'schedules'

function readStoredSchedules(): Schedule[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultSchedules

  try {
    return JSON.parse(raw) as Schedule[]
  } catch {
    return defaultSchedules
  }
}

function persist(schedules: Schedule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
}

interface SchedulesState {
  schedules: Schedule[]
  addSchedule: (schedule: Schedule) => void
  updateSchedule: (id: string, schedule: Schedule) => void
  deleteSchedule: (id: string) => void
}

const initialSchedules = readStoredSchedules()
if (!localStorage.getItem(STORAGE_KEY)) {
  persist(initialSchedules)
}

export const useSchedulesStore = create<SchedulesState>()((set) => ({
  schedules: initialSchedules,
  addSchedule: (schedule) =>
    set((state) => {
      const schedules = [...state.schedules, schedule]
      persist(schedules)
      return { schedules }
    }),
  updateSchedule: (id, schedule) =>
    set((state) => {
      const schedules = state.schedules.map((s) => (s.id === id ? schedule : s))
      persist(schedules)
      return { schedules }
    }),
  deleteSchedule: (id) =>
    set((state) => {
      const schedules = state.schedules.filter((s) => s.id !== id)
      persist(schedules)
      return { schedules }
    }),
}))
