import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем seed базы данных...')
  
  // Создаём тестовую компанию
  const company = await prisma.company.upsert({
    where: { id: 'seed-company' },
    update: {},
    create: {
      id: 'seed-company',
      name: 'Строй Мастер',
      region: 'Москва'
    }
  })
  console.log('✅ Создана компания:', company.name)
  
  // Создаём тестового пользователя
  const user = await prisma.user.upsert({
    where: { id: 'seed-user' },
    update: {},
    create: {
      id: 'seed-user',
      email: 'test@example.com',
      name: 'Тестовый Пользователь',
      companyId: company.id,
      role: 'ADMIN'
    }
  })
  console.log('✅ Создан пользователь:', user.email)
  
  // Создаём базовый каталог цен
  const catalog = await prisma.priceCatalog.upsert({
    where: { id: 'seed-catalog' },
    update: {},
    create: {
      id: 'seed-catalog',
      companyId: company.id,
      name: 'Базовый каталог цен',
      isDefault: true
    }
  })
  console.log('✅ Создан каталог цен:', catalog.name)
  
  // Добавляем позиции в каталог
  const priceItems = [
    // Штукатурка
    { stageCode: 'PLASTER', workCode: 'PLASTER_WALLS', name: 'Штукатурка стен по маякам', unit: 'м²', basePrice: 720 },
    
    // Черновая электрика
    { stageCode: 'ELEC_ROUGH', workCode: 'ELEC_POINT', name: 'Электроточка (розетка/выключатель)', unit: 'точка', basePrice: 950 },
    
    // Черновая сантехника
    { stageCode: 'PLUMB_ROUGH', workCode: 'PLUMB_POINT', name: 'Сантехническая точка', unit: 'точка', basePrice: 1200 },
    
    // Стяжка
    { stageCode: 'SCREED', workCode: 'SCREED_BASE', name: 'Стяжка пола 40мм', unit: 'м²', basePrice: 650 },
    
    // ГКЛ
    { stageCode: 'GKL', workCode: 'GKL_CEILING', name: 'Потолок из ГКЛ в 1 слой', unit: 'м²', basePrice: 1200 },
    { stageCode: 'GKL', workCode: 'GKL_PARTITION', name: 'Перегородка из ГКЛ', unit: 'м²', basePrice: 1500 },
    
    // Плитка
    { stageCode: 'TILE', workCode: 'TILE_WALLS', name: 'Укладка плитки на стены', unit: 'м²', basePrice: 1500 },
    { stageCode: 'TILE', workCode: 'TILE_FLOOR', name: 'Укладка плитки на пол', unit: 'м²', basePrice: 1300 },
    
    // Напольные покрытия
    { stageCode: 'FLOOR', workCode: 'FLOOR_LAMINATE', name: 'Укладка ламината', unit: 'м²', basePrice: 600 },
    { stageCode: 'FLOOR', workCode: 'FLOOR_PARQUET', name: 'Укладка паркета', unit: 'м²', basePrice: 1200 },
    
    // Подготовка под окраску
    { stageCode: 'PAINT_PREP', workCode: 'PUTTY', name: 'Шпаклевка стен под окраску', unit: 'м²', basePrice: 350 },
    
    // Окраска
    { stageCode: 'PAINT', workCode: 'PAINT_WALLS', name: 'Окраска стен', unit: 'м²', basePrice: 300 },
    { stageCode: 'PAINT', workCode: 'PAINT_CEILING', name: 'Окраска потолков', unit: 'м²', basePrice: 280 },
    
    // Финишные работы
    { stageCode: 'FINISH', workCode: 'FIN_TOILET', name: 'Установка унитаза', unit: 'шт', basePrice: 2500 },
    { stageCode: 'FINISH', workCode: 'FIN_SINK', name: 'Установка раковины', unit: 'шт', basePrice: 2000 },
    { stageCode: 'FINISH', workCode: 'FIN_BASEBOARD', name: 'Установка плинтуса', unit: 'м.п.', basePrice: 250 },
    { stageCode: 'FINISH', workCode: 'FIN_DOOR', name: 'Установка межкомнатной двери', unit: 'шт', basePrice: 3500 }
  ]
  
  for (const item of priceItems) {
    await prisma.priceItem.upsert({
      where: {
        id: `seed-${item.workCode}`
      },
      update: {},
      create: {
        id: `seed-${item.workCode}`,
        catalogId: catalog.id,
        ...item,
        isActive: true
      }
    })
  }
  
  console.log(`✅ Добавлено ${priceItems.length} позиций в каталог`)
  
  // Добавляем рыночные цены для Москвы
  const marketPrices = [
    { stageCode: 'PLASTER', workCode: 'PLASTER_WALLS', p10: 600, p50: 720, p90: 900 },
    { stageCode: 'ELEC_ROUGH', workCode: 'ELEC_POINT', p10: 800, p50: 950, p90: 1200 },
    { stageCode: 'SCREED', workCode: 'SCREED_BASE', p10: 550, p50: 650, p90: 800 },
    { stageCode: 'TILE', workCode: 'TILE_WALLS', p10: 1200, p50: 1500, p90: 2000 },
    { stageCode: 'TILE', workCode: 'TILE_FLOOR', p10: 1100, p50: 1300, p90: 1800 }
  ]
  
  for (const price of marketPrices) {
    await prisma.marketPrice.upsert({
      where: {
        region_stageCode_workCode: {
          region: 'Москва',
          stageCode: price.stageCode,
          workCode: price.workCode
        }
      },
      update: price,
      create: {
        region: 'Москва',
        unit: 'м²',
        source: 'Seed данные',
        ...price
      }
    })
  }
  
  console.log(`✅ Добавлено ${marketPrices.length} рыночных цен`)
  
  console.log('✅ Seed завершён!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

