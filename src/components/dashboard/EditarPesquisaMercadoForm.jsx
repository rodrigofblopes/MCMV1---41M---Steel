export default function EditarPesquisaMercadoForm({
  nomeProjeto,
  fatorCorrecao,
  areaUnidadeM2,
  areaTerrenoM2,
  onFatorChange,
  onAreaUnidadeChange,
  onAreaTerrenoChange,
  onVoltar,
  onCancelar,
  onSalvar,
}) {
  return (
    <div className="min-h-0 flex-1 bg-[#f0f4f8] px-4 py-6 text-[#1e293b] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={onVoltar}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-[#1e293b] shadow-sm transition-colors hover:bg-slate-50"
        >
          ← Voltar
        </button>

        <header className="mt-6">
          <p className="text-sm font-medium text-slate-500">Apresentação ao investidor</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e293b] sm:text-3xl">{nomeProjeto}</h1>
        </header>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
            <h2 className="text-base font-bold text-[#1e293b]">Parâmetros da proposta</h2>
          </div>

          <div className="grid gap-6 px-5 py-6 sm:grid-cols-2 sm:px-8">
            <div>
              <label htmlFor="pm-fator-correcao" className="mb-1.5 block text-sm font-semibold text-[#1e293b]">
                Fator de Correção
              </label>
              <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
                <input
                  id="pm-fator-correcao"
                  type="text"
                  inputMode="decimal"
                  className="min-w-0 flex-1 rounded-l-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                  value={fatorCorrecao}
                  onChange={(e) => onFatorChange(e.target.value)}
                  placeholder="1,00"
                  autoComplete="off"
                />
                <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                  %
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="pm-area-unidade" className="mb-1.5 block text-sm font-semibold text-[#1e293b]">
                Área da unidade
              </label>
              <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
                <input
                  id="pm-area-unidade"
                  type="text"
                  inputMode="decimal"
                  className="min-w-0 flex-1 rounded-l-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                  value={areaUnidadeM2}
                  onChange={(e) => onAreaUnidadeChange(e.target.value)}
                  placeholder="138,7"
                  autoComplete="off"
                />
                <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                  m²
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Valor da unidade = média R$/m² das amostras de unidade × esta área.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-6 sm:px-8">
            <label htmlFor="pm-area-terreno" className="mb-1.5 block text-sm font-semibold text-[#1e293b]">
              Área do lote (terreno da unidade)
            </label>
            <div className="flex max-w-md rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
              <input
                id="pm-area-terreno"
                type="text"
                inputMode="decimal"
                className="min-w-0 flex-1 rounded-l-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                value={areaTerrenoM2}
                onChange={(e) => onAreaTerrenoChange(e.target.value)}
                placeholder="ex.: 300 (12×25 m)"
                autoComplete="off"
              />
              <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                m²
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Valor do lote = média R$/m² das amostras de terreno × esta área (mesmo fator de correção % acima).
            </p>
          </div>

          <div className="flex flex-row flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-8">
            <button
              type="button"
              onClick={onCancelar}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#1e293b] shadow-sm hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSalvar}
              className="rounded-full bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
