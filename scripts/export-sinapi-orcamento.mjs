/**
 * Lê a planilha sintética SINAPI na raiz do projeto e gera src/data/sinapiOrcamento.json
 * Coloque o .xlsx na raiz e execute: npm run data:sinapi
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outPath = path.join(root, 'src', 'data', 'sinapiOrcamento.json')

/** Prioriza planilha Steel (St); senão Casa Popular sintética; senão primeiro .xlsx. */
function findSinteticoXlsx() {
  const all = fs.readdirSync(root).filter((n) => n.endsWith('.xlsx'))
  const hit =
    all.find(
      (n) =>
        /casa popular/i.test(n) &&
        (/\bSt\b| - St -/i.test(n)) &&
        (/sint/i.test(n) || /material/i.test(n)),
    ) ||
    all.find((n) => /casa popular/i.test(n) && (/sint/i.test(n) || /material/i.test(n))) ||
    all.find((n) => /sint/i.test(n)) ||
    all[0]
  if (!hit) throw new Error('Nenhum ficheiro .xlsx na raiz do projeto.')
  return path.join(root, hit)
}

function cellText(sh, r, c) {
  const addr = XLSX.utils.encode_cell({ r, c })
  const cell = sh[addr]
  if (!cell) return ''
  const t = cell.w != null ? String(cell.w) : cell.v != null ? String(cell.v) : ''
  return t.trim()
}

function rowArray(sh, r, c0, c1) {
  const row = []
  for (let c = c0; c <= c1; c++) row.push(cellText(sh, r, c))
  return row
}

function parseTipo(row) {
  const j9 = row[9] || ''
  const j10 = row[10] || ''
  if (j9.includes('Totais') || j9.includes('Total') || j10.includes('Total')) return 'rodape_total'

  const item = row[0]
  const codigo = row[1]
  const banco = row[2]
  const descricao = row[3]
  const und = row[4]

  const hasCodigo = Boolean(codigo && codigo.replace(/\s/g, ''))
  const hasBanco = Boolean(banco)
  const hasUnd = Boolean(und)
  if (hasCodigo || (hasBanco && hasUnd)) return 'servico'

  const itemTrim = item.replace(/\s/g, '')
  if (itemTrim && /^\d+(\.\d+)*$/.test(itemTrim) && descricao) return 'secao'

  if (descricao && !itemTrim && !hasCodigo) return 'outro'

  return 'vazio'
}

function main() {
  const fp = findSinteticoXlsx()
  console.log('Planilha:', path.basename(fp))
  const wb = XLSX.readFile(fp)
  const sh = wb.Sheets[wb.SheetNames[0]]

  const r1 = rowArray(sh, 1, 0, 13)
  const r2 = rowArray(sh, 2, 0, 13)

  const cabecalho = {
    planilhaTitulo: r2[0] || 'Extração Dados Orçamento - 41 m²',
    obra: r1[3] || '',
    sinapiReferencia: (r1[4] || '').replace(/\n/g, ' ').trim(),
    bdi: r1[7] || '',
    notaEncargos: (r1[10] || '').replace(/\n/g, ' ').trim(),
    arquivoOrigem: path.basename(fp),
  }

  const linhas = []
  let resumoTotais = null

  for (let r = 5; r <= 300; r++) {
    const row = rowArray(sh, r, 0, 13)
    if (!row.some((x) => x)) continue

    const tipo = parseTipo(row)
    if (tipo === 'vazio') continue

    if (tipo === 'rodape_total') {
      const label = row[9] || row[8] || ''
      const vMo = row[10] || ''
      const vMat = row[11] || ''
      const vTot = row[12] || ''
      const primeiroValorMo = [vMo, vMat, vTot].find((x) => x && /[\d]/.test(x)) || ''
      const valorUnico = [row[10], row[11], row[12]].filter((x) => x && /[\d]/.test(x)).pop() || ''
      if (label.includes('Totais')) {
        resumoTotais = {
          totalMO: vMo,
          totalMAT: vMat,
          totalComposicao: vTot,
        }
      } else if (label.includes('sem BDI')) {
        resumoTotais = { ...resumoTotais, totalSemBDI: valorUnico }
      } else if (label.includes('Total do BDI')) {
        resumoTotais = { ...resumoTotais, totalBDI: valorUnico }
      } else if (label.includes('Total Geral')) {
        resumoTotais = { ...resumoTotais, totalGeral: valorUnico }
      }
      linhas.push({ tipo: 'rodape_total', label, mo: vMo, mat: vMat, total: vTot || primeiroValorMo })
      continue
    }

    if (tipo === 'secao') {
      linhas.push({
        tipo: 'secao',
        item: row[0],
        descricao: row[3],
        total: row[12],
        peso: row[13],
      })
      continue
    }

    if (tipo === 'servico') {
      linhas.push({
        tipo: 'servico',
        item: row[0],
        codigo: row[1],
        banco: row[2],
        descricao: row[3],
        und: row[4],
        quant: row[5],
        valorUnit: row[6],
        vuMO: row[7],
        vuMAT: row[8],
        vuTotal: row[9],
        totalMO: row[10],
        totalMAT: row[11],
        total: row[12],
        peso: row[13],
      })
      continue
    }

    linhas.push({ tipo: 'outro', raw: row })
  }

  const payload = {
    geradoEm: new Date().toISOString(),
    cabecalho,
    resumoTotais,
    linhas,
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8')
  console.log('Escrito:', outPath, 'linhas:', linhas.length)
}

main()
