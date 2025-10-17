'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatMoney } from '@/lib/utils'

interface MarketBadgeProps {
  currentPrice: number
  marketP50: number
  marketP10?: number
  marketP90?: number
}

export function MarketBadge({ 
  currentPrice, 
  marketP50, 
  marketP10, 
  marketP90 
}: MarketBadgeProps) {
  // Рассчитываем отклонение от медианы рынка
  const deviation = ((currentPrice - marketP50) / marketP50) * 100
  const isHigher = deviation > 5
  const isLower = deviation < -5
  const isNeutral = !isHigher && !isLower
  
  return (
    <div className="inline-flex items-center gap-2">
      {/* Индикатор */}
      <div className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
        ${isHigher ? 'bg-red-100 text-red-700' : ''}
        ${isLower ? 'bg-green-100 text-green-700' : ''}
        ${isNeutral ? 'bg-zinc-100 text-zinc-700' : ''}
      `}>
        {isHigher && <TrendingUp className="w-3 h-3" />}
        {isLower && <TrendingDown className="w-3 h-3" />}
        {isNeutral && <Minus className="w-3 h-3" />}
        
        {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
      </div>
      
      {/* Детали рынка */}
      <div className="text-xs text-zinc-500">
        Рынок: {formatMoney(marketP50)}
        {marketP10 && marketP90 && (
          <span className="ml-1">
            ({formatMoney(marketP10)}–{formatMoney(marketP90)})
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================
// Сравнение с рынком для всей позиции
// ============================================

interface MarketComparisonProps {
  region: string
  items: Array<{
    name: string
    unitPrice: number
    marketData?: {
      p10: number
      p50: number
      p90: number
    }
  }>
}

export function MarketComparison({ region, items }: MarketComparisonProps) {
  const itemsWithMarket = items.filter(item => item.marketData)
  
  if (itemsWithMarket.length === 0) {
    return (
      <div className="bg-zinc-50 border rounded-lg p-4 text-center text-sm text-zinc-600">
        Нет данных о рыночных ценах для региона "{region}"
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Сравнение с рынком</h4>
        <span className="text-sm text-zinc-500">Регион: {region}</span>
      </div>
      
      <div className="space-y-2">
        {itemsWithMarket.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white border rounded">
            <span className="text-sm font-medium">{item.name}</span>
            <MarketBadge
              currentPrice={item.unitPrice}
              marketP50={item.marketData!.p50}
              marketP10={item.marketData!.p10}
              marketP90={item.marketData!.p90}
            />
          </div>
        ))}
      </div>
      
      {/* Легенда */}
      <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 border-t">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-100" />
          <span>Ниже рынка</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-zinc-100" />
          <span>В рынке</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-100" />
          <span>Выше рынка</span>
        </div>
      </div>
    </div>
  )
}

