import ExcelJS from 'exceljs'
import { chromium } from 'playwright'
import { STAGE_NAMES, STAGE_ORDER } from './constants'

// ============================================
// Типы
// ============================================

export interface EstimateExportData {
  projectName: string
  companyName?: string
  companyLogo?: string
  createdAt: Date
  stages: {
    stageCode: string
    stageName: string
    items: {
      name: string
      unit: string
      qty: number
      unitPrice: number
      total: number
    }[]
    stageTotal: number
  }[]
  grandTotal: number
}

// ============================================
// Экспорт в XLSX
// ============================================

export async function exportToExcel(data: EstimateExportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Смета')
  
  // Настройка колонок
  sheet.columns = [
    { header: '№', key: 'num', width: 5 },
    { header: 'Наименование работ', key: 'name', width: 50 },
    { header: 'Ед. изм.', key: 'unit', width: 10 },
    { header: 'Кол-во', key: 'qty', width: 10 },
    { header: 'Цена', key: 'price', width: 12 },
    { header: 'Сумма', key: 'total', width: 15 }
  ]
  
  // Заголовок
  sheet.mergeCells('A1:F1')
  const titleRow = sheet.getCell('A1')
  titleRow.value = `СМЕТА: ${data.projectName}`
  titleRow.font = { size: 16, bold: true }
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' }
  
  // Информация о компании
  if (data.companyName) {
    sheet.mergeCells('A2:F2')
    const companyRow = sheet.getCell('A2')
    companyRow.value = data.companyName
    companyRow.font = { size: 12 }
    companyRow.alignment = { horizontal: 'center' }
  }
  
  sheet.addRow([]) // Пустая строка
  
  // Заголовки колонок
  const headerRow = sheet.addRow(['№', 'Наименование работ', 'Ед. изм.', 'Кол-во', 'Цена', 'Сумма'])
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  }
  
  let rowNum = 1
  
  // Данные по этапам
  for (const stage of data.stages) {
    // Заголовок этапа
    const stageRow = sheet.addRow(['', stage.stageName, '', '', '', ''])
    stageRow.font = { bold: true, size: 12 }
    stageRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }
    }
    
    // Работы этапа
    for (const item of stage.items) {
      sheet.addRow([
        rowNum++,
        item.name,
        item.unit,
        item.qty,
        item.unitPrice,
        item.total
      ])
    }
    
    // Итого по этапу
    const stageTotalRow = sheet.addRow(['', `Итого: ${stage.stageName}`, '', '', '', stage.stageTotal])
    stageTotalRow.font = { bold: true }
    
    sheet.addRow([]) // Пустая строка
  }
  
  // Общий итог
  const grandTotalRow = sheet.addRow(['', 'ИТОГО', '', '', '', data.grandTotal])
  grandTotalRow.font = { bold: true, size: 14 }
  grandTotalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFEB3B' }
  }
  
  // Форматирование чисел
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 4) { // После заголовков
      const qtyCell = row.getCell(4)
      const priceCell = row.getCell(5)
      const totalCell = row.getCell(6)
      
      if (typeof qtyCell.value === 'number') {
        qtyCell.numFmt = '0.00'
      }
      if (typeof priceCell.value === 'number') {
        priceCell.numFmt = '#,##0.00 ₽'
      }
      if (typeof totalCell.value === 'number') {
        totalCell.numFmt = '#,##0.00 ₽'
      }
    }
  })
  
  // Границы
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 3) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    }
  })
  
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

// ============================================
// Экспорт в PDF через HTML -> Playwright
// ============================================

export async function exportToPdf(data: EstimateExportData): Promise<Buffer> {
  // Генерируем HTML
  const html = generateEstimateHtml(data)
  
  // Конвертируем в PDF через Playwright
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  await page.setContent(html, { waitUntil: 'networkidle' })
  
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    }
  })
  
  await browser.close()
  
  return Buffer.from(pdf)
}

// ============================================
// Генерация HTML для PDF
// ============================================

function generateEstimateHtml(data: EstimateExportData): string {
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(value)
  }
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  let stagesHtml = ''
  let rowNum = 1
  
  for (const stage of data.stages) {
    stagesHtml += `
      <tr class="stage-header">
        <td colspan="6">${stage.stageName}</td>
      </tr>
    `
    
    for (const item of stage.items) {
      stagesHtml += `
        <tr>
          <td class="num">${rowNum++}</td>
          <td>${item.name}</td>
          <td class="center">${item.unit}</td>
          <td class="right">${formatNumber(item.qty)}</td>
          <td class="right">${formatMoney(item.unitPrice)}</td>
          <td class="right">${formatMoney(item.total)}</td>
        </tr>
      `
    }
    
    stagesHtml += `
      <tr class="stage-total">
        <td colspan="5">Итого: ${stage.stageName}</td>
        <td class="right">${formatMoney(stage.stageTotal)}</td>
      </tr>
      <tr class="spacer"><td colspan="6"></td></tr>
    `
  }
  
  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Смета - ${data.projectName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          font-size: 10pt;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 18pt;
          margin-bottom: 10px;
        }
        .header .company {
          font-size: 12pt;
          color: #666;
        }
        .header .date {
          font-size: 9pt;
          color: #999;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        thead th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        .stage-header td {
          background-color: #f8f8f8;
          font-weight: bold;
          font-size: 11pt;
          padding: 10px 8px;
        }
        .stage-total td {
          font-weight: bold;
          background-color: #fafafa;
        }
        .grand-total td {
          font-weight: bold;
          font-size: 12pt;
          background-color: #fff9c4;
          padding: 12px 8px;
        }
        .spacer td {
          border: none;
          padding: 5px;
        }
        .num { width: 40px; text-align: center; }
        .center { text-align: center; }
        .right { text-align: right; }
        .footer {
          margin-top: 40px;
          font-size: 9pt;
          color: #999;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>СМЕТА</h1>
        <div class="project">${data.projectName}</div>
        ${data.companyName ? `<div class="company">${data.companyName}</div>` : ''}
        <div class="date">Дата: ${data.createdAt.toLocaleDateString('ru-RU')}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Наименование работ</th>
            <th>Ед. изм.</th>
            <th>Кол-во</th>
            <th>Цена</th>
            <th>Сумма</th>
          </tr>
        </thead>
        <tbody>
          ${stagesHtml}
          <tr class="grand-total">
            <td colspan="5">ИТОГО</td>
            <td class="right">${formatMoney(data.grandTotal)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="footer">
        Сгенерировано в SmetaGPT
      </div>
    </body>
    </html>
  `
}

// ============================================
// Подготовка данных для экспорта из БД
// ============================================

export function prepareEstimateData(
  estimate: any,
  project: any,
  company?: any
): EstimateExportData {
  const stagesMap = new Map<string, any>()
  
  // Группируем работы по этапам
  for (const item of estimate.items) {
    if (!stagesMap.has(item.stageCode)) {
      stagesMap.set(item.stageCode, {
        stageCode: item.stageCode,
        stageName: STAGE_NAMES[item.stageCode as keyof typeof STAGE_NAMES] || item.stageCode,
        items: [],
        stageTotal: 0
      })
    }
    
    const stage = stagesMap.get(item.stageCode)
    stage.items.push({
      name: item.name,
      unit: item.unit,
      qty: item.qty,
      unitPrice: item.unitPrice,
      total: item.total
    })
    stage.stageTotal += item.total
  }
  
  // Сортируем этапы по порядку
  const stages = Array.from(stagesMap.values()).sort((a, b) => {
    const indexA = STAGE_ORDER.indexOf(a.stageCode)
    const indexB = STAGE_ORDER.indexOf(b.stageCode)
    return indexA - indexB
  })
  
  const grandTotal = stages.reduce((sum, stage) => sum + stage.stageTotal, 0)
  
  return {
    projectName: project.name,
    companyName: company?.name,
    companyLogo: company?.logo,
    createdAt: estimate.createdAt,
    stages,
    grandTotal
  }
}

