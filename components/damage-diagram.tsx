"use client"

interface DamageDiagramProps {
  damagedParts: string[]
  onPartClick: (partName: string) => void
}

export function DamageDiagram({ damagedParts, onPartClick }: DamageDiagramProps) {
  const carParts = [
    // Left Side
    { id: "left-front-fender", name: "Błotnik przedni lewy", d: "M45,50 L65,55 L65,75 L45,80 Z" },
    { id: "left-front-door", name: "Drzwi przednie lewe", d: "M67,55 L88,60 L88,80 L67,75 Z" },
    { id: "left-rear-door", name: "Drzwi tylne lewe", d: "M90,60 L110,65 L110,85 L90,80 Z" },
    { id: "left-rear-fender", name: "Błotnik tylny lewy", d: "M112,65 L135,70 L135,90 L112,85 Z" },
    { id: "left-front-wheel", name: "Koło przednie lewe", d: "M50,82 A10,10 0 1,0 70,82 A10,10 0 1,0 50,82" },
    { id: "left-rear-wheel", name: "Koło tylne lewe", d: "M105,87 A10,10 0 1,0 125,87 A10,10 0 1,0 105,87" },
    { id: "left-front-light", name: "Reflektor przedni lewy", d: "M40,50 L45,50 L45,60 L40,60 Z" },
    { id: "left-rear-light", name: "Lampa tylna lewa", d: "M135,70 L140,72 L140,80 L135,80 Z" },
    { id: "left-mirror", name: "Lusterko lewe", d: "M65,50 L70,50 L70,55 L65,55 Z" },

    // Rear
    { id: "rear-bumper", name: "Zderzak tylny", d: "M180,130 L280,130 L275,140 L185,140 Z" },
    { id: "trunk", name: "Pokrywa bagażnika", d: "M190,100 L270,100 L270,130 L190,130 Z" },
    { id: "rear-window", name: "Szyba tylna", d: "M195,60 L265,60 L265,98 L195,98 Z" },
    { id: "rear-left-light-cluster", name: "Lampa tylna lewa (tył)", d: "M180,100 L190,100 L190,130 L180,130 Z" },
    { id: "rear-right-light-cluster", name: "Lampa tylna prawa (tył)", d: "M270,100 L280,100 L280,130 L270,130 Z" },
    { id: "roof-rear", name: "Dach (tył)", d: "M195,50 L265,50 L265,60 L195,60 Z" },

    // Right Side
    { id: "right-front-fender", name: "Błotnik przedni prawy", d: "M415,50 L395,55 L395,75 L415,80 Z" },
    { id: "right-front-door", name: "Drzwi przednie prawe", d: "M393,55 L372,60 L372,80 L393,75 Z" },
    { id: "right-rear-door", name: "Drzwi tylne prawe", d: "M370,60 L350,65 L350,85 L370,80 Z" },
    { id: "right-rear-fender", name: "Błotnik tylny prawy", d: "M348,65 L325,70 L325,90 L348,85 Z" },
    { id: "right-front-wheel", name: "Koło przednie prawe", d: "M410,82 A10,10 0 1,1 390,82 A10,10 0 1,1 410,82" },
    { id: "right-rear-wheel", name: "Koło tylne prawe", d: "M355,87 A10,10 0 1,1 335,87 A10,10 0 1,1 355,87" },
    { id: "right-front-light", name: "Reflektor przedni prawy", d: "M420,50 L415,50 L415,60 L420,60 Z" },
    { id: "right-rear-light", name: "Lampa tylna prawa", d: "M325,70 L320,72 L320,80 L325,80 Z" },
    { id: "right-mirror", name: "Lusterko prawe", d: "M395,50 L390,50 L390,55 L395,55 Z" },
  ]

  return (
    <div className="w-full">
      <svg viewBox="0 0 460 160" className="w-full h-auto">
        {/* Left Car Outline */}
        <path
          d="M40,60 C20,60 20,80 40,80 L45,80 L45,50 L40,50 Q30,50 40,60 Z"
          stroke="gray"
          fill="lightgray"
          strokeWidth="1"
        />
        <path
          d="M45,50 L135,70 L140,72 L140,80 L135,80 L135,90 A15,15 0 0,0 120,105 L100,105 A15,15 0 0,0 85,90 L75,90 A15,15 0 0,0 60,105 L40,105 L45,80 L65,75 L88,80 L110,85 L112,85 L112,65 L90,60 L67,55 L45,50 Z"
          stroke="gray"
          fill="#f0f0f0"
          strokeWidth="1"
        />
        <path d="M68,56 L88,61 L88,79 L68,74 Z" stroke="gray" fill="lightgray" strokeWidth="0.5" />
        <path d="M90,61 L108,66 L108,84 L90,79 Z" stroke="gray" fill="lightgray" strokeWidth="0.5" />

        {/* Rear Car Outline */}
        <path
          d="M180,100 C170,100 170,130 180,130 L185,140 L275,140 L280,130 C290,130 290,100 280,100 L270,100 L270,60 L265,50 L195,50 L190,60 L190,100 Z"
          stroke="gray"
          fill="#f0f0f0"
          strokeWidth="1"
        />

        {/* Right Car Outline */}
        <path
          d="M420,60 C440,60 440,80 420,80 L415,80 L415,50 L420,50 Q430,50 420,60 Z"
          stroke="gray"
          fill="lightgray"
          strokeWidth="1"
        />
        <path
          d="M415,50 L325,70 L320,72 L320,80 L325,80 L325,90 A15,15 0 0,1 340,105 L360,105 A15,15 0 0,1 375,90 L385,90 A15,15 0 0,1 400,105 L420,105 L415,80 L395,75 L372,80 L350,85 L348,85 L348,65 L370,60 L393,55 L415,50 Z"
          stroke="gray"
          fill="#f0f0f0"
          strokeWidth="1"
        />
        <path d="M392,56 L372,61 L372,79 L392,74 Z" stroke="gray" fill="lightgray" strokeWidth="0.5" />
        <path d="M370,61 L352,66 L352,84 L370,79 Z" stroke="gray" fill="lightgray" strokeWidth="0.5" />

        {/* Clickable parts */}
        {carParts.map((part) => (
          <path
            key={part.id}
            d={part.d}
            className={`cursor-pointer transition-all duration-200 ${
              damagedParts.includes(part.name)
                ? "fill-yellow-400 stroke-yellow-600"
                : "fill-transparent hover:fill-blue-300/50"
            }`}
            strokeWidth="0.5"
            onClick={() => onPartClick(part.name)}
          >
            <title>{part.name}</title>
          </path>
        ))}
      </svg>
    </div>
  )
}
