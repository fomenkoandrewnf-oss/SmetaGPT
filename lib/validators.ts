import { z } from 'zod'

// ============================================
// Pre-Upload форма
// ============================================

export const PreuploadSchema = z.object({
  floor_area_m2: z.number().positive().max(1000),
  living_rooms_count: z.number().int().min(0).max(20),
  has_kitchen_living: z.boolean(),
  bathrooms_count: z.number().int().min(0).max(10),
  ceiling_height_m: z.number().positive().max(5).optional()
})

export type PreuploadHints = z.infer<typeof PreuploadSchema>

// ============================================
// Проект
// ============================================

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  floor_area_m2: z.number().positive().max(1000),
  living_rooms_count: z.number().int().min(0).max(20),
  has_kitchen_living: z.boolean(),
  bathrooms_count: z.number().int().min(0).max(10),
  ceiling_height_m: z.number().positive().max(5).optional()
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

// ============================================
// Помещение
// ============================================

export const RoomSchema = z.object({
  name: z.string(),
  area_m2: z.number().positive(),
  perimeter_m: z.number().positive().optional(),
  is_wet_zone: z.boolean().optional().default(false),
  height_m: z.number().positive().optional(),
  notes: z.string().optional()
})

export type RoomInput = z.infer<typeof RoomSchema>

// ============================================
// AI-анализ результат
// ============================================

export const AnalysisResultSchema = z.object({
  total_area_m2: z.number().positive(),
  ceiling_height_m: z.number().positive().optional(),
  rooms: z.array(RoomSchema),
  bathrooms_count: z.number().int().min(0),
  notes: z.string().optional()
})

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>

// ============================================
// Смета
// ============================================

export const EstimateItemSchema = z.object({
  stage_code: z.string(),
  work_code: z.string(),
  name: z.string(),
  unit: z.string(),
  qty: z.number(),
  unit_price: z.number(),
  total: z.number(),
  meta_json: z.any().optional()
})

export type EstimateItemInput = z.infer<typeof EstimateItemSchema>

export const UpdateEstimateItemsSchema = z.array(z.object({
  id: z.string(),
  qty: z.number().optional(),
  unit_price: z.number().optional()
}))

// ============================================
// Каталог цен
// ============================================

export const PriceCatalogSchema = z.object({
  name: z.string().min(1).max(200),
  is_default: z.boolean().optional().default(false)
})

export const PriceItemSchema = z.object({
  stage_code: z.string(),
  work_code: z.string(),
  name: z.string(),
  unit: z.string(),
  base_price: z.number().positive(),
  coef_json: z.any().optional(),
  is_active: z.boolean().optional().default(true)
})

export type PriceItemInput = z.infer<typeof PriceItemSchema>

