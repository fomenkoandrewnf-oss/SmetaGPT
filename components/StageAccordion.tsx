'use client'

import { useState } from 'react'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { formatMoney, formatNumber } from '@/lib/utils'
import { STAGE_NAMES, STAGE_ORDER } from '@/lib/constants'
import type { StageCode } from '@/lib/constants'

interface EstimateItem {
  id: string
  stageCode: string
  workCode: string
  name: string
  unit: string
  qty: number
  unitPrice: number
  total: number
  notes?: string
}

interface StageAccordionProps {
  items: EstimateItem[]
  onItemUpdate?: (itemId: string, field: 'qty' | 'unitPrice', value: number) => void
  readonly?: boolean
}

interface StageData {
  stageCode: string
  stageName: string
  items: EstimateItem[]
  stageTotal: number
}

export function StageAccordion({ items, onItemUpdate, readonly = false }: StageAccordionProps) {
  // Группируем работы по этапам
  const stagesMap = new Map<string, StageData>()
  
  for (const item of items) {
    if (!stagesMap.has(item.stageCode)) {
      stagesMap.set(item.stageCode, {
        stageCode: item.stageCode,
        stageName: STAGE_NAMES[item.stageCode as StageCode] || item.stageCode,
        items: [],
        stageTotal: 0
      })
    }
    
    const stage = stagesMap.get(item.stageCode)!
    stage.items.push(item)
    stage.stageTotal += item.total
  }
  
  // Сортируем этапы по порядку
  const stages = Array.from(stagesMap.values()).sort((a, b) => {
    const indexA = STAGE_ORDER.indexOf(a.stageCode as StageCode)
    const indexB = STAGE_ORDER.indexOf(b.stageCode as StageCode)
    return indexA - indexB
  })
  
  const grandTotal = stages.reduce((sum, stage) => sum + stage.stageTotal, 0)
  
  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={stages.map(s => s.stageCode)} className="space-y-2">
        {stages.map((stage) => (
          <AccordionItem 
            key={stage.stageCode} 
            value={stage.stageCode}
            className="border rounded-lg overflow-hidden bg-white"
          >
            <AccordionTrigger className="px-6 hover:no-underline hover:bg-zinc-50">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="text-lg font-semibold">{stage.stageName}</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatMoney(stage.stageTotal)}
                </span>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-0 pb-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 border-y">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-sm">Наименование</th>
                      <th className="text-center py-3 px-4 font-medium text-sm w-24">Ед. изм.</th>
                      <th className="text-right py-3 px-4 font-medium text-sm w-32">Кол-во</th>
                      <th className="text-right py-3 px-4 font-medium text-sm w-36">Цена</th>
                      <th className="text-right py-3 px-6 font-medium text-sm w-40">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stage.items.map((item) => (
                      <EstimateRow
                        key={item.id}
                        item={item}
                        onUpdate={onItemUpdate}
                        readonly={readonly}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* Общий итог */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">ИТОГО</span>
          <span className="text-3xl font-bold text-yellow-900">
            {formatMoney(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Строка сметы (редактируемая)
// ============================================

interface EstimateRowProps {
  item: EstimateItem
  onUpdate?: (itemId: string, field: 'qty' | 'unitPrice', value: number) => void
  readonly: boolean
}

function EstimateRow({ item, onUpdate, readonly }: EstimateRowProps) {
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

