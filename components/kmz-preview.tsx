"use client"

import { useEffect, useRef } from "react"
import JSZip from "jszip"
import * as toGeoJSON from "@mapbox/togeojson"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface KmzPreviewProps {
  url: string
}

export function KmzPreview({ url }: KmzPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let map: L.Map | null = null
    async function load() {
      if (!mapRef.current) return
      try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)
        const kmlFileName = Object.keys(zip.files).find((n) =>
          n.toLowerCase().endsWith(".kml")
        )
        if (!kmlFileName) return
        const kmlText = await zip.files[kmlFileName].async("text")
        const dom = new DOMParser().parseFromString(kmlText, "application/xml")
        const geojson = toGeoJSON.kml(dom)
        map = L.map(mapRef.current)
        const layer = L.geoJSON(geojson)
        const bounds = layer.getBounds()
        map.fitBounds(bounds)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map)
        layer.addTo(map)
      } catch (e) {
        console.error("Error loading KMZ", e)
      }
    }
    load()
    return () => {
      if (map) map.remove()
    }
  }, [url])

  return <div ref={mapRef} className="w-full h-[70vh]" />
}

export default KmzPreview
