const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const getDurationMinutes = (timeFrom: string, timeTo: string) => {
  const from = toMinutes(timeFrom)
  const to = toMinutes(timeTo)
  return to >= from ? to - from : 24 * 60 - from + to
}

export const formatDuration = (timeFrom: string, timeTo: string) => {
  const duration = getDurationMinutes(timeFrom, timeTo)
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  if (!minutes) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  if (!hours) return `${minutes} minutes`
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} minutes`
}
