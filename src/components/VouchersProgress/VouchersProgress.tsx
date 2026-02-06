import type { VoucherStatusDataType } from '../../services/vouchers/vouchers.types';

type VoucherProgressProps = {
    dados: VoucherStatusDataType;
};

export const VoucherProgress = ({ dados }: VoucherProgressProps) => {
    // Se não estiver rodando nem concluído (idle) ou total for 0, não mostra nada
    if (dados.status_job === 'idle' || dados.total === 0) return null;

    const isConcluido = dados.status_job === 'concluido';

    return (
        <div className="mb-8 p-6 pill-collum rounded-lg bg-gray-50 border border-gray-200 shadow-sm transition-all">
            {/* Cabeçalho */}
            <h2 className="section-title mb-4 flex items-center gap-2">
                {isConcluido ? (
                    <span className="text-green-600 flex items-center gap-2">
                        ✅ Geração de Vouchers Concluída
                    </span>
                ) : (
                    <span className="text-blue-600 animate-pulse flex items-center gap-2">
                        ⚙️ Gerando Vouchers...
                    </span>
                )}
            </h2>

            {/* Barra de Progresso */}
            <div className="relative mt-3 w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                    style={{
                        width: `${dados.porcentagem}%`,
                        background: isConcluido ? '#41c982' : '#027b8b',
                        transition: 'width 0.5s ease-in-out',
                    }}
                    className="h-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                >
                    {dados.porcentagem}%
                </div>
            </div>

            <div className="flex justify-between items-center mt-2 text-sm text-gray-600 mb-6">
                <span className="font-medium">Progresso Geral</span>
                <span>
                    <strong>{dados.processados}</strong> de {dados.total} vouchers
                </span>
            </div>

            {/* Lista Detalhada */}
            {dados.detalhes && dados.detalhes.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-4 animate-fadeIn">
                    <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                        Detalhes por Produto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dados.detalhes.map((detalhe, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-3 rounded border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col overflow-hidden mr-3">
                                    <span
                                        className="font-medium text-gray-800 text-sm truncate"
                                        title={detalhe.nome_produto}
                                    >
                                        {detalhe.nome_produto}
                                    </span>
                                    <span
                                        className={`text-[10px] font-bold uppercase mt-0.5 ${
                                            detalhe.status === 'concluido' ? 'text-green-500' : 'text-orange-400'
                                        }`}
                                    >
                                        {detalhe.status}
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <span
                                        className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                                            detalhe.processados === detalhe.total
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-50 text-blue-700'
                                        }`}
                                    >
                                        {detalhe.processados} / {detalhe.total}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};