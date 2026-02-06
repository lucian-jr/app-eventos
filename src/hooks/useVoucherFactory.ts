import { useState, useEffect, useRef, useCallback } from 'react';
import { createVoucherGenerationJob, getVoucherGenerationStatus } from '../services/vouchers/vouchers.service';
import type { VoucherStatusDataType } from '../services/vouchers/vouchers.types';

// ATUALIZAÇÃO 1: O hook agora recebe o ID do evento opcionalmente
export const useVoucherFactory = (eventId?: number) => {
    const [isStarting, setIsStarting] = useState(false);
    const [progresso, setProgresso] = useState<VoucherStatusDataType>({
        status_job: 'idle',
        processados: 0,
        total: 0,
        porcentagem: 0
    });

    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- FUNÇÃO 1: Iniciar o Trabalho ---
    const iniciarProducao = async (qtd: number, produtoId: number, idEventoParams: number) => {
        setIsStarting(true);
        
        const response = await createVoucherGenerationJob({
            id_evento: idEventoParams,
            id_produto: produtoId,
            quantidade: qtd
        });

        setIsStarting(false);

        if (response.status === 'success') {
            console.log("Job criado com sucesso. ID:", response.job_id);
            // Força o início do monitoramento após criar
            monitorarProgresso(); 
        } else {
            alert(`Erro: ${response.message}`);
        }
    };

    // --- FUNÇÃO 2: Consultar API (Polling Inteligente) ---
    const checarStatus = useCallback(async () => {
        // Se não tiver ID do evento, não tem como consultar
        if (!eventId) return;

        // ATUALIZAÇÃO 2: Passamos o ID para o service
        const response = await getVoucherGenerationStatus(eventId);

        if (response.status === 'success' && response.data) {
            setProgresso(response.data);
            
            const status = response.data.status_job;

            // ATUALIZAÇÃO 3: Regra de Parada Refinada
            // Para se acabou (concluido), se deu erro, OU se não tem nada rodando (idle)
            if (status === 'concluido' || status === 'erro' || status === 'idle') {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
            }
        }
    }, [eventId]);

    // --- FUNÇÃO 3: Ativar o Loop ---
    const monitorarProgresso = useCallback(() => {
        if (!eventId) return;

        // Limpa anterior para garantir
        if (pollingRef.current) clearInterval(pollingRef.current);
        
        // Chama 1 vez imediatamente para atualizar a tela rápido
        checarStatus();
        
        // Configura o loop (2 segundos)
        pollingRef.current = setInterval(checarStatus, 2000);
    }, [checarStatus, eventId]);

    // --- EFEITO: Monitoria Automática ---
    useEffect(() => {
        monitorarProgresso();

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [monitorarProgresso]);

    return {
        iniciarProducao,
        loadingRequest: isStarting,
        dados: progresso,
        recheck: monitorarProgresso // Expõe caso queira forçar checagem manual
    };
};