'use client'

import { Room } from '@/lib/rules'
import { formatNumber } from '@/lib/utils'
import { Droplets } from 'lucide-react'

interface RoomPreviewProps {
  rooms: Room[]
  warnings?: string[]
}

export function RoomPreview({ rooms, warnings = [] }: RoomPreviewProps) {
  const totalArea = rooms.reduce((sum, room) => sum + room.area_m2, 0)
  const wetZones = rooms.filter(r => r.is_wet_zone)
  
  return (
    <div className="space-y-4">
      {/* Предупреждения */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-yellow-900 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Обнаружены расхождения
          </h3>
          <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
            {warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Общая информация */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-50 rounded-lg p-4">
          <p className="text-sm text-zinc-600 mb-1">Всего помещений</p>
          <p className="text-2xl font-bold">{rooms.length}</p>
        </div>
        <div className="bg-zinc-50 rounded-lg p-4">
          <p className="text-sm text-zinc-600 mb-1">Общая площадь</p>
          <p className="text-2xl font-bold">{formatNumber(totalArea)} м²</p>
        </div>
        <div className="bg-zinc-50 rounded-lg p-4">
          <p className="text-sm text-zinc-600 mb-1">Мокрых зон</p>
          <p className="text-2xl font-bold">{wetZones.length}</p>
        </div>
      </div>
      
      {/* Таблица помещений */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-sm">Помещение</th>
              <th className="text-right py-3 px-4 font-medium text-sm">Площадь, м²</th>
              <th className="text-right py-3 px-4 font-medium text-sm">Периметр, м</th>
              <th className="text-right py-3 px-4 font-medium text-sm">Высота, м</th>
              <th className="text-center py-3 px-4 font-medium text-sm">Тип</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, index) => (
              <tr key={index} className="border-b last:border-b-0 hover:bg-zinc-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {room.is_wet_zone && (
                      <Droplets className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="font-medium">{room.name}</span>
                  </div>
                  {room.notes && (
                    <p className="text-xs text-zinc-500 mt-1">{room.notes}</p>
                  )}
                </td>
                <td className="text-right py-3 px-4 tabular-nums">
                  {formatNumber(room.area_m2)}
                </td>
                <td className="text-right py-3 px-4 tabular-nums text-zinc-600">
                  {room.perimeter_m ? formatNumber(room.perimeter_m) : '—'}
                </td>
                <td className="text-right py-3 px-4 tabular-nums text-zinc-600">
                  {room.height_m ? formatNumber(room.height_m) : '—'}
                </td>
                <td className="text-center py-3 px-4">
                  {room.is_wet_zone ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Мокрая
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
                      Сухая
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

