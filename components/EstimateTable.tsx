'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { formatMoney, formatNumber } from '@/lib/utils'

interface EstimateItem {
  id: string
  name: string
  unit: string
  qty: number
  unitPrice: number
  total: number
  notes?: string
}

interface EstimateTableProps {
  items: EstimateItem[]
  title?: string
  onItemUpdate?: (itemId: string, field: 'qty' | 'unitPrice', value: number) => void
  readonly?: boolean
  showTotal?: boolean
}

export function EstimateTable({ 
  items, 
  title,
  onItemUpdate, 
  readonly = false,
  showTotal = true
}: EstimateTableProps) {
  const total = items.reduce((sum, item) => sum + item.total, 0)
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {title && (
        <div className="bg-zinc-50 border-b px-6 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-sm">Наименование</th>
              <th className="text-center py-3 px-4 font-medium text-sm w-24">Ед. изм.</th>
              <th className="text-right py-3 px-4 font-medium text-sm w-32">Кол-во</th>
              <th className="text-right py-3 px-4 font-medium text-sm w-36">Цена</th>
              <th className="text-right py-3 px-6 font-medium text-sm w-40">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <EditableRow
                key={item.id}
                item={item}
                onUpdate={onItemUpdate}
                readonly={readonly}
              />
            ))}
          </tbody>
          {showTotal && (
            <tfoot className="bg-zinc-50 border-t">
              <tr>
                <td colSpan={4} className="text-right py-4 px-6 font-semibold">
                  Итого:
                </td>
                <td className="text-right py-4 px-6 font-bold text-lg">
                  {formatMoney(total)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

// ============================================
// Редактируемая строка таблицы
// ============================================

interface EditableRowProps {
  item: EstimateItem
  onUpdate?: (itemId: string, field: 'qty' | 'unitPrice', value: number) => void
  readonly: boolean
}

function EditableRow({ item, onUpdate, readonly }: EditableRowProps) {
  const [editing, setEditing] = useState<'qty' | 'unitPrice' | null>(null)
  const [tempValue, setTempValue] = useState<string>('')
  
  const handleStartEdit = (field: 'qty' | 'unitPrice') => {
    if (readonly) return
    setEditing(field)
    setTempValue(String(item[field]))
  }
  
  const handleSave = () => {
    if (!editing || !onUpdate) return
    
    const value = parseFloat(tempValue)
    if (!isNaN(value) && value >= 0) {
      onUpdate(item.id, editing, value)
    }
    
    setEditing(null)
    setTempValue('')
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditing(null)
      setTempValue('')
    }
  }
  
  return (
    <tr className="border-b last:border-b-0 hover:bg-zinc-50">
      <td className="py-3 px-6">
        <div className="font-medium">{item.name}</div>
        {item.notes && (
          <div className="text-xs text-zinc-500 mt-1">{item.notes}</div>
        )}
      </td>
      
      <td className="text-center py-3 px-4 text-zinc-600">
        {item.unit}
      </td>
      
      <td className="text-right py-3 px-4 tabular-nums">
        {editing === 'qty' ? (
          <Input
            type="number"
            step="0.01"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full text-right"
            autoFocus
          />
        ) : (
          <button
            onClick={() => handleStartEdit('qty')}
            disabled={readonly}
            className={`
              w-full text-right px-2 py-1 rounded
              ${!readonly && 'hover:bg-blue-50 cursor-pointer'}
            `}
          >
            {formatNumber(item.qty)}
          </button>
        )}
      </td>
      
      <td className="text-right py-3 px-4 tabular-nums">
        {editing === 'unitPrice' ? (
          <Input
            type="number"
            step="0.01"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full text-right"
            autoFocus
          />
        ) : (
          <button
            onClick={() => handleStartEdit('unitPrice')}
            disabled={readonly}
            className={`
              w-full text-right px-2 py-1 rounded
              ${!readonly && 'hover:bg-blue-50 cursor-pointer'}
            `}
          >
            {formatMoney(item.unitPrice)}
          </button>
        )}
      </td>
      
      <td className="text-right py-3 px-6 font-semibold tabular-nums">
        {formatMoney(item.total)}
      </td>
    </tr>
  )
}

