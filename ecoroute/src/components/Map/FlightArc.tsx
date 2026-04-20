import { useEffect, useRef, useState } from 'react'
import { Polyline, Marker } from 'react-leaflet'
import L from 'leaflet'
import type { City } from '../../types'
import { ARC_POINT_COUNT, ARC_ANIMATION_MS, PLANE_DELAY_MS } from '../../utils/constants'

interface Props {
  origin: City
  destination: City
}

/** Interpolates `count` lat/lng points along a great-circle approximation. */
function interpolateArc(
  origin: City,
  destination: City,
  count: number,
): L.LatLngExpression[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    return [
      origin.lat + (destination.lat - origin.lat) * t,
      origin.lng + (destination.lng - origin.lng) * t,
    ] as L.LatLngExpression
  })
}

const planeIcon = L.divIcon({
  html: '<span style="font-size:18px;line-height:1;">✈</span>',
  className: '',
  iconAnchor: [9, 9],
})

export default function FlightArc({ origin, destination }: Props) {
  const polylineRef = useRef<L.Polyline>(null)
  const [showPlane, setShowPlane] = useState(false)

  const points = interpolateArc(origin, destination, ARC_POINT_COUNT)
  const midPoint = points[Math.floor(ARC_POINT_COUNT / 2)] as [number, number]

  useEffect(() => {
    setShowPlane(false)
    const line = polylineRef.current
    if (!line) return

    // Access the underlying SVG path element
    const path = (line as unknown as { _path: SVGPathElement | undefined })._path
    if (!path) return

    const length = path.getTotalLength()
    path.style.transition = 'none'
    path.style.strokeDasharray  = `${length}`
    path.style.strokeDashoffset = `${length}`

    // Force reflow so the browser registers the initial state
    path.getBoundingClientRect()

    path.style.transition = `stroke-dashoffset ${ARC_ANIMATION_MS}ms ease-in-out`
    path.style.strokeDashoffset = '0'

    const timer = setTimeout(() => setShowPlane(true), PLANE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [origin.id, destination.id])

  return (
    <>
      <Polyline
        ref={polylineRef}
        positions={points}
        pathOptions={{ color: '#22c55e', weight: 2, opacity: 0.85 }}
      />
      {showPlane && (
        <Marker position={midPoint} icon={planeIcon} />
      )}
    </>
  )
}
