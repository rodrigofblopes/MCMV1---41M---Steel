import { useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import CadastrarUnidade from '../components/forms/CadastrarUnidade.jsx'
import { useAmostras } from '../contexts/AmostrasContext.jsx'
import { amostraParaCamposFormulario } from '../utils/amostraForm.js'

export default function EditarAmostra() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { amostras, updateAmostra } = useAmostras()

  const amostra = useMemo(
    () => amostras.find((a) => String(a.id) === String(id)),
    [amostras, id],
  )

  const valoresIniciais = useMemo(() => (amostra ? amostraParaCamposFormulario(amostra) : null), [amostra])

  if (!amostra || !valoresIniciais) {
    return <Navigate to="/apresentacao-investidor" replace />
  }

  return (
    <CadastrarUnidade
      key={amostra.id}
      variant={amostra.tipo === 'terreno' || amostra.tipo === 'servico' ? amostra.tipo : 'unidade'}
      titulo="Editar amostra do portfólio"
      subtitulo={`Comparável #${amostra.id} — altere os dados usados na proposta ao investidor`}
      voltarPara="/apresentacao-investidor"
      valoresIniciais={valoresIniciais}
      textoBotaoSalvar="Salvar alterações"
      onSalvar={(payload) => {
        updateAmostra(amostra.id, payload)
        navigate("/apresentacao-investidor")
      }}
    />
  )
}
