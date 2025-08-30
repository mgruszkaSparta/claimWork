"use client"

import { useState, useEffect, useMemo } from "react"

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
  HEAVY = 2,
}

interface DamageDiagramProps {
  damageData?: { [key: string]: DamageLevel }
  /**
   * Backwards compatibility: some places pass a simple list of damaged part IDs
   * without specifying a damage level. In that case we treat every part as
   * having a light damage level.
   */
  damagedParts?: string[]
  onPartClick: (partName: string, newLevel: DamageLevel) => void
  vehicleType?: VehicleType
}

export function DamageDiagram({
  damageData,
  damagedParts = [],
  onPartClick,
  vehicleType = VehicleType.PASSENGER_CAR,
}: DamageDiagramProps) {
  const [svgContent, setSvgContent] = useState<string>("")

  // Ensure we always work with a valid damage map
  const effectiveDamageData: { [key: string]: DamageLevel } = useMemo(
    () =>
      damageData ??
      Object.fromEntries(damagedParts.map((p) => [p, DamageLevel.LIGHT])),
    [damageData, damagedParts]
  )

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
        const currentLevel = effectiveDamageData[partId] || DamageLevel.NONE
        let newLevel: DamageLevel

        switch (currentLevel) {
          case DamageLevel.NONE:
            newLevel = DamageLevel.LIGHT
            break
          case DamageLevel.LIGHT:
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

      const damageLevel = effectiveDamageData[svgElement.id] || DamageLevel.NONE
      switch (damageLevel) {
        case DamageLevel.LIGHT:
          svgElement.style.fill = "#fbbf24" // Yellow for light damage
          svgElement.style.stroke = "#f59e0b"
          svgElement.style.strokeWidth = "2"
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
  }, [svgContent, effectiveDamageData, onPartClick])

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
    return Object.values(effectiveDamageData).filter((level) => level > DamageLevel.NONE).length
  }

  const getDamageLevelName = (level: DamageLevel): string => {
    switch (level) {
      case DamageLevel.LIGHT:
        return "Lekkie"
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

      // Detailed car parts
      "rear-left-door-handle": "Tylna lewa klamka",
      "rear-left-door": "Tylne lewe drzwi",
      "front-left-door": "Przednie lewe drzwi",
      "part-49": "Część 49",
      "front-left-tire": "Przednia lewa opona",
      "front-left-rim": "Przednia lewa felga",
      "part-48": "Część 48",
      radiator: "Chłodnica",
      "left-fog-light": "Lewa lampa przeciwmgielna",
      "front-left-light": "Lewy przedni reflektor",
      "front-left-wheel-arch": "Przednie lewe nadkole",
      mask: "Maska",
      "left-mirror": "Lewe lusterko",
      "front-left-door-handle": "Przednia lewa klamka",
      "left-sill-panel": "Lewy próg",
      "front-left-side-window": "Przednia lewa szyba boczna",
      windscreen: "Przednia szyba",
      "rear-left-wheel-arch": "Tylne lewe nadkole",
      sunroof: "Szyberdach",
      "rear-left-side-window": "Tylna lewa szyba boczna",
      "left-quarter-window": "Lewe okienko trójkątne",
      "rear-left-inside-light": "Tylna lewa lampka wewnętrzna",
      "rear-left-outside-light": "Tylna lewa lampa zewnętrzna",
      "rear-left-tire": "Tylna lewa opona",
      "rear-left-rim": "Tylna lewa felga",
      "left-muffler": "Lewy tłumik",
      "rear-right-side-window": "Tylna prawa szyba boczna",
      "rear-right-wheel-arch": "Tylne prawe nadkole",
      "rear-right-door": "Tylne prawe drzwi",
      "front-right-side-window": "Przednia prawa szyba boczna",
      "front-right-door": "Przednie prawe drzwi",
      "right-mirror": "Prawe lusterko",
      "front-right-wheel-arch": "Przednie prawe nadkole",
      "front-right-light": "Prawy przedni reflektor",
      "right-quarter-window": "Prawe okienko trójkątne",
      "rear-right-inside-light": "Tylna prawa lampka wewnętrzna",
      "rear-right-rim": "Tylna prawa felga",
      "rear-right-tire": "Tylna prawa opona",
      "front-right-tire": "Przednia prawa opona",
      "front-right-rim": "Przednia prawa felga",
      "rear-right-outside-light": "Tylna prawa lampa zewnętrzna",
      "right-muffler": "Prawy tłumik",
      "right-fog-light": "Prawa lampa przeciwmgielna",
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
      [DamageLevel.HEAVY]: [] as string[],
    }

    Object.entries(effectiveDamageData).forEach(([partId, level]) => {
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
