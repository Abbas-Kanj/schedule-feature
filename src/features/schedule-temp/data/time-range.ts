const timeToMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const getTimeRangeMinutes = (fromTime: string, toTime: string) => {
  if (!fromTime || !toTime) return 0
  const fromMinutes = timeToMinutes(fromTime)
  const toMinutes = timeToMinutes(toTime)
  return toMinutes >= fromMinutes
    ? toMinutes - fromMinutes
    : 24 * 60 - fromMinutes + toMinutes
}

export const formatTimeRange = (fromTime: string, toTime: string) => {
  const totalMinutes = getTimeRangeMinutes(fromTime, toTime)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (!hours) return `${minutes} min`
  if (!minutes) return `${hours} hr${hours === 1 ? '' : 's'}`
  return `${hours} hr${hours === 1 ? '' : 's'} ${minutes} min`
}

