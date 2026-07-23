import type { Park } from '~/types/park'

const hasCoordinates = (park: Park) => Number.isFinite(park.latitude) && Number.isFinite(park.longitude)

export const buildGoogleMapsUrl = (park: Park): string => {
  const params = new URLSearchParams({ api: '1' })
  if (hasCoordinates(park)) {
    params.set('query', `${park.latitude},${park.longitude}`)
  } else {
    const fallback = [park.name, park.address, park.city, park.district, '台灣']
      .filter(Boolean)
      .join(', ')
    params.set('query', fallback)
  }
  return `https://www.google.com/maps/search/?${params.toString()}`
}

export const hasParkCoordinates = hasCoordinates
