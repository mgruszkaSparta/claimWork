"use client"

import { useState, useEffect } from "react"

export enum VehicleType {
  TRACTOR = "tractor",
  TRAILER = "trailer",
  PASSENGER_CAR = "passengercar",
  SUV = "suv",
  TRUCK = "truck",
}

export enum DamageLevel {
  NONE = 0,
  LIGHT = 1,
  MEDIUM = 2,
  HEAVY = 3,
}

interface DamageDiagramProps {
  damageData: { [key: string]: DamageLevel }
  onPartClick: (partName: string, newLevel: DamageLevel) => void
  vehicleType: VehicleType
}

export function DamageDiagram({ damageData, onPartClick, vehicleType }: DamageDiagramProps) {
  const [svgContent, setSvgContent] = useState<string>("")

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const response = await fetch(`/${vehicleType}.svg`)
        const svgText = await response.text()
        setSvgContent(svgText)
      } catch (error) {
        console.error("Error loading SVG:", error)
        setSvgContent("")
      }
    }

    loadSvg()
  }, [vehicleType])

  useEffect(() => {
    if (!svgContent) return

    const svgContainer = document.querySelector(".damage-diagram-svg")
    if (!svgContainer) return

    const elements = svgContainer.querySelectorAll("path, rect, circle, ellipse, polygon")

    elements.forEach((element, index) => {
      const svgElement = element as SVGElement

      if (!svgElement.id) {
        svgElement.id = `part-${index}`
      }

      svgElement.style.cursor = "pointer"

      const handleClick = (e: Event) => {
        e.stopPropagation()
        const partId = svgElement.id
        const currentLevel = damageData[partId] || DamageLevel.NONE
        let newLevel: DamageLevel

        switch (currentLevel) {
          case DamageLevel.NONE:
            newLevel = DamageLevel.LIGHT
            break
          case DamageLevel.LIGHT:
            newLevel = DamageLevel.MEDIUM
            break
          case DamageLevel.MEDIUM:
            newLevel = DamageLevel.HEAVY
            break
          case DamageLevel.HEAVY:
            newLevel = DamageLevel.NONE
            break
          default:
            newLevel = DamageLevel.LIGHT
        }

        onPartClick(partId, newLevel)
      }

      svgElement.removeEventListener("click", handleClick)
      svgElement.addEventListener("click", handleClick)

      const damageLevel = damageData[svgElement.id] || DamageLevel.NONE
      switch (damageLevel) {
        case DamageLevel.LIGHT:
          svgElement.style.fill = "#fbbf24" // Yellow for light damage
          svgElement.style.stroke = "#f59e0b"
          svgElement.style.strokeWidth = "2"
          svgElement.style.opacity = "0.8"
          break
        case DamageLevel.MEDIUM:
          svgElement.style.fill = "#f97316" // Orange for medium damage
          svgElement.style.stroke = "#ea580c"
          svgElement.style.strokeWidth = "3"
          svgElement.style.opacity = "0.8"
          break
        case DamageLevel.HEAVY:
          svgElement.style.fill = "#dc2626" // Red for heavy damage
          svgElement.style.stroke = "#b91c1c"
          svgElement.style.strokeWidth = "4"
          svgElement.style.opacity = "0.9"
          break
        default: // NONE
          svgElement.style.fill = "#f8fafc"
          svgElement.style.stroke = "#64748b"
          svgElement.style.strokeWidth = "1"
          svgElement.style.opacity = "1"
      }
    })
  }, [svgContent, damageData, onPartClick])

  const getVehicleDisplayName = (type: VehicleType): string => {
    switch (type) {
      case VehicleType.TRACTOR:
        return "Traktor"
      case VehicleType.TRAILER:
        return "Przyczepa"
      case VehicleType.PASSENGER_CAR:
        return "Samochód osobowy"
      case VehicleType.SUV:
        return "SUV"
      case VehicleType.TRUCK:
        return "Ciężarówka"
      default:
        return "Pojazd"
    }
  }

  const getDamagedPartsCount = () => {
    return Object.values(damageData).filter((level) => level > DamageLevel.NONE).length
  }

  const getDamageLevelName = (level: DamageLevel): string => {
    switch (level) {
      case DamageLevel.LIGHT:
        return "Lekkie"
      case DamageLevel.MEDIUM:
        return "Średnie"
      case DamageLevel.HEAVY:
        return "Duże"
      default:
        return "Brak"
    }
  }

  const translatePartName = (partId: string): string => {
    // Common vehicle part translations
    const translations: { [key: string]: string } = {
      // Generic parts
      door: "Drzwi",
      hood: "Maska",
      trunk: "Bagażnik",
      roof: "Dach",
      windshield: "Przednia szyba",
      "rear-window": "Tylna szyba",
      "side-window": "Boczna szyba",
      bumper: "Zderzak",
      "front-bumper": "Przedni zderzak",
      "rear-bumper": "Tylny zderzak",
      fender: "Błotnik",
      mirror: "Lusterko",
      headlight: "Reflektor",
      taillight: "Tylne światło",
      wheel: "Koło",
      tire: "Opona",
      grille: "Grill",
      panel: "Panel",
      "quarter-panel": "Panel boczny",
      pillar: "Słupek",
      "running-board": "Stopień",

      // Truck/Trailer specific
      cab: "Kabina",
      "trailer-body": "Naczepa",
      "cargo-area": "Przestrzeń ładunkowa",
      "loading-dock": "Rampa załadunkowa",
      "mud-flap": "Chlapacz",

      // Car specific
      "front-door": "Przednie drzwi",
      "rear-door": "Tylne drzwi",
      "driver-door": "Drzwi kierowcy",
      "passenger-door": "Drzwi pasażera",
      "left-door": "Lewe drzwi",
      "right-door": "Prawe drzwi",
    }

    // Try to find a translation based on part ID or common patterns
    const lowerPartId = partId.toLowerCase()

    // Check for exact matches first
    if (translations[lowerPartId]) {
      return translations[lowerPartId]
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(translations)) {
      if (lowerPartId.includes(key) || key.includes(lowerPartId)) {
        return value
      }
    }

    // If no translation found, try to make it more readable
    if (partId.startsWith("part-")) {
      const partNumber = partId.replace("part-", "")
      return `Część ${partNumber}`
    }

    // Return original if no translation available
    return partId.charAt(0).toUpperCase() + partId.slice(1).replace(/[-_]/g, " ")
  }

  const getDamagedPartsByLevel = () => {
    const partsByLevel = {
      [DamageLevel.LIGHT]: [] as string[],
      [DamageLevel.MEDIUM]: [] as string[],
      [DamageLevel.HEAVY]: [] as string[],
    }

    Object.entries(damageData).forEach(([partId, level]) => {
      if (level > DamageLevel.NONE) {
        partsByLevel[level].push(translatePartName(partId))
      }
    })

    return partsByLevel
  }

  const damagedPartsByLevel = getDamagedPartsByLevel()

  return (
      <div className="w-full space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Diagram uszkodzeń - {getVehicleDisplayName(vehicleType)}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Kliknij na części pojazdu aby oznaczyć uszkodzenia. Kolejne kliknięcia zmieniają poziom uszkodzenia.
          </p>
        </div>

        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-sm font-medium text-gray-700">Legenda:</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-gray-400 bg-white rounded"></div>
              <span className="text-sm text-gray-600">Brak uszkodzeń</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-600 bg-yellow-400 rounded"></div>
              <span className="text-sm text-gray-600">Lekkie uszkodzenia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-600 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-600">Średnie uszkodzenia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-red-700 bg-red-600 rounded"></div>
              <span className="text-sm text-gray-600">Duże uszkodzenia</span>
            </div>
            <div className="ml-auto text-sm text-gray-600">
              Uszkodzonych części: <span className="font-semibold text-blue-600">{getDamagedPartsCount()}</span>
            </div>
          </div>
        </div>

        {getDamagedPartsCount() > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Lista uszkodzeń</h3>
              <div className="space-y-3">
                {Object.entries(damagedPartsByLevel).map(([level, parts]) => {
                  const damageLevel = Number.parseInt(level) as DamageLevel
                  if (parts.length === 0) return null

                  return (
                      <div key={level} className="flex items-start gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                              className={`w-3 h-3 rounded border-2 ${
                                  damageLevel === DamageLevel.LIGHT
                                      ? "bg-yellow-400 border-amber-600"
                                      : damageLevel === DamageLevel.MEDIUM
                                          ? "bg-orange-500 border-orange-600"
                                          : "bg-red-600 border-red-700"
                              }`}
                          ></div>
                          <span className="text-sm font-medium text-gray-700">
                      {getDamageLevelName(damageLevel)} ({parts.length}):
                    </span>
                        </div>
                        <div className="flex-1 text-sm text-gray-600">{parts.join(", ")}</div>
                      </div>
                  )
                })}
              </div>
            </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {svgContent ? (
              <div
                  className="w-full damage-diagram-svg flex justify-center"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
              />
          ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <div className="text-2xl mb-2">🚗</div>
                  <div>Ładowanie diagramu pojazdu...</div>
                </div>
              </div>
          )}
        </div>
      </div>
  )
}
