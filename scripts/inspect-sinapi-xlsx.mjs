import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const allXlsx = fs.readdirSync(root).filter((n) => n.endsWith('.xlsx'))
const preferSt = allXlsx.find(
  (n) =>
    /casa popular/i.test(n) && /\bSt\b| - St -/i.test(n) && (/sint/i.test(n) || /material/i.test(n)),
)
const target =
  preferSt ||
  allXlsx.find((n) => /casa popular/i.test(n) && (/sint/i.test(n) || /material/i.test(n))) ||
  allXlsx.find((n) => /sint/i.test(n)) ||
  allXlsx[0]
if (!target) {
  console.error('Nenhum .xlsx na raiz do projeto.')
  process.exit(1)
}
for (const f of [target]) {
  const fp = path.join(root, f)
  const wb = XLSX.readFile(fp, { cellDates: true, raw: false })
  console.log('FILE', f)
  console.log('SHEETS', wb.SheetNames)
  for (const sn of wb.SheetNames) {
    const sh = wb.Sheets[sn]
    const ref = sh['!ref']
    console.log('\n---', sn, ref)
    const rows = XLSX.utils.sheet_to_json(sh, { header: 1, defval: '', blankrows: false })
    const preview = rows.slice(0, 35)
    preview.forEach((r, i) => console.log(String(i).padStart(3), JSON.stringify(r)))
  }
}
