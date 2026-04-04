import { AREA_CONSTRUIDA_REF_TEXTO } from '../../constants/areaProjeto.js'
import {
  AMBIENTES_PLANTA_MCMV,
  COEFICIENTES_MEDIOS_NBR12721,
  somarAreasEquivalentes,
  somarAreasReais,
} from '../../data/nbr12721Equivalencia.js'
function fmtM2(n) {
  return `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`
}

function fmtCoef(n) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })
}

export default function TabelasEquivalenciaNBR12721() {
  const totalReal = somarAreasReais()
  const totalEq = somarAreasEquivalentes()

  return (
    <div className="mt-12 space-y-10 border-t border-slate-200 pt-10">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Área equivalente — NBR 12721:2005
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          A norma define <strong>área equivalente</strong> como área virtual cujo custo de construção equivale ao da área
          real, quando o custo difere do padrão de referência (item <strong>5.7.1</strong>). Com orçamento por
          dependência, o <strong>coeficiente</strong> é o custo unitário da dependência dividido pelo custo unitário
          básico divulgado (<strong>5.7.2.1.3</strong>). Na falta dessa demonstração, podem usar-se os{' '}
          <strong>coeficientes médios</strong> do item <strong>5.7.3</strong> (tabela abaixo).
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Texto de apoio à leitura do PDF oficial da ABNT no projeto; não substitui a norma. Áreas dos ambientes conforme
          cotas da planta baixa desta unidade.
        </p>
        <aside className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-[#1e293b]">Exemplo da norma (nota ao item 5.7.3)</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Para área real coberta de <strong>60 m²</strong>, se o custo unitário efetivo for cerca de{' '}
            <strong>50% superior</strong> ao CUB das áreas padrão, o coeficiente vale <strong>1,50</strong> e a área
            equivalente é{' '}
            <span className="font-mono text-slate-800">
              Se = 60 × 1,50 = 90 m²
            </span>
            .
          </p>
        </aside>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
          Coeficientes médios (NBR 12721 — item 5.7.3)
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-sm">
          <table className="w-full min-w-[520px] text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Dependência / situação</th>
                <th className="px-4 py-3 text-right">Coeficiente (faixa ou valor)</th>
              </tr>
            </thead>
            <tbody>
              {COEFICIENTES_MEDIOS_NBR12721.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{row.id})</td>
                  <td className="px-4 py-2.5">{row.dependencia}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{row.coeficienteTexto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
          Aplicação aos ambientes desta planta
        </h3>
        <p className="mb-3 max-w-3xl text-sm text-slate-600">
          Dependências internas cobertas no padrão da unidade foram alinhadas ao item <strong>(b)</strong> — coeficiente{' '}
          <strong>1,00</strong>. A <strong>varanda</strong> segue o item <strong>(f)</strong> (0,75 a 1,00); na coluna
          &quot;Adotado&quot; usa-se <strong>0,875</strong> como valor médio ilustrativo — revisar com acabamento e
          orçamento (5.7.2).
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Ambiente</th>
                <th className="px-4 py-3 text-right">Área real (planta)</th>
                <th className="px-4 py-3">Ref. 5.7.3</th>
                <th className="px-4 py-3 text-right">Coef. mín.–máx.</th>
                <th className="px-4 py-3 text-right">Coef. adotado</th>
                <th className="px-4 py-3 text-right">Área equivalente</th>
              </tr>
            </thead>
            <tbody>
              {AMBIENTES_PLANTA_MCMV.map((a) => {
                const eq = a.areaRealM2 * a.coefAdotado
                const faixa =
                  a.coefMin === a.coefMax
                    ? fmtCoef(a.coefMin)
                    : `${fmtCoef(a.coefMin)} – ${fmtCoef(a.coefMax)}`
                return (
                  <tr key={a.nome} className="border-b border-slate-100">
                    <td className="px-4 py-2.5 font-medium text-[#1e293b]">{a.nome}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmtM2(a.areaRealM2)}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      ({a.itemNorma}) {a.descricaoNorma}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{faixa}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmtCoef(a.coefAdotado)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmtM2(eq)}</td>
                  </tr>
                )
              })}
              <tr className="bg-slate-50 font-semibold text-[#1e293b]">
                <td className="px-4 py-3">Totais</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtM2(totalReal)}</td>
                <td className="px-4 py-3" colSpan={2} />
                <td className="px-4 py-3 text-right text-xs font-normal text-slate-500">—</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtM2(totalEq)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          A soma das áreas da planta ({fmtM2(totalReal)}) refere-se às superfícies cotadas nos compartimentos. A área
          construída total do empreendimento ({AREA_CONSTRUIDA_REF_TEXTO} m²) pode incluir paredes e critérios do memorial,
          fora desta soma.
        </p>
      </section>
    </div>
  )
}
