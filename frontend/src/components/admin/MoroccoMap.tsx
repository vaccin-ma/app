import React, { type FC } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useTranslation } from 'react-i18next'
import type { RegionData } from '../../api/admin' // Adjust path if needed

// Coordinates for the 12 regions of Morocco (approximate centers)
const REGION_COORDINATES: Record<string, [number, number]> = {
  'Tanger-Tétouan-Al Hoceima': [35.135, -5.45],
  "L'Oriental": [33.8, -2.5],
  'Fès-Meknès': [33.8, -4.5],
  'Rabat-Salé-Kénitra': [34.02, -6.6],
  'Béni Mellal-Khénifra': [32.5, -6.0],
  'Casablanca-Settat': [33.3, -7.6],
  'Marrakech-Safi': [31.6, -8.0],
  'Drâa-Tafilalet': [31.5, -5.0],
  'Souss-Massa': [30.0, -8.5],
  'Guelmim-Oued Noun': [28.5, -10.0],
  'Laâyoune-Sakia El Hamra': [26.8, -12.0],
  'Dakhla-Oued Ed-Dahab': [23.0, -15.0],
}

interface MoroccoMapProps {
  data: RegionData[]
  hoveredRegion: string | null
  onHover: (name: string | null) => void
}

const statusColors = {
  green: '#10B981', // emerald-500
  yellow: '#FBBF24', // amber-400
  red: '#F43F5E', // rose-500
}

// Component to handle map view reset or interactions if needed
export const MoroccoMap: FC<MoroccoMapProps> = ({ data, hoveredRegion, onHover }) => {
  const { t } = useTranslation()

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
       <MapContainer
        {...{
          center: [29.5, -7.0] as [number, number],
          zoom: 5,
          scrollWheelZoom: true,
          style: { height: '100%', width: '100%' },
          className: 'z-0',
        } as React.ComponentProps<typeof MapContainer>}
      >
        <TileLayer
          {...{
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          } as React.ComponentProps<typeof TileLayer>}
        />
        
        {data.map((region) => {
          const coords = REGION_COORDINATES[region.name]
          if (!coords) return null

          const isHovered = hoveredRegion === region.name
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const color = (statusColors as any)[region.status]

          return (
            <CircleMarker
              key={region.name}
              {...{
                center: coords,
                pathOptions: {
                  color: isHovered ? '#1F2937' : 'white',
                  fillColor: color,
                  fillOpacity: isHovered ? 0.9 : 0.7,
                  weight: isHovered ? 3 : 2,
                },
                radius: isHovered ? 18 : 14,
                eventHandlers: {
                  mouseover: () => onHover(region.name),
                  mouseout: () => onHover(null),
                },
              } as React.ComponentProps<typeof CircleMarker>}
            >
              <Popup>
                <div className="p-1 min-w-[140px]">
                  <h3 className="font-bold text-gray-900 mb-1">{region.name}</h3>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('admin.coverage')}:</span>
                      <span className={`font-bold ${
                        region.status === 'green' ? 'text-emerald-600' :
                        region.status === 'yellow' ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {region.coverage}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('admin.population')}:</span>
                      <span className="font-medium">{region.population.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg border border-gray-100 z-[1000] text-sm">
         <h4 className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-wider">Immunity Status</h4>
         <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>≥ 95% ({t('admin.safe')})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span>85-95% ({t('admin.warning')})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>&lt; 85% ({t('admin.danger')})</span>
            </div>
         </div>
      </div>
    </div>
  )
}
