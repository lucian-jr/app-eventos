import { useState, useEffect, useRef, useCallback } from 'react';
import { createVoucherGenerationJob, getVoucherGenerationStatus } from '../services/vouchers/vouchers.service';
import type { VoucherStatusDataType } from '../services/vouchers/vouchers.types';

export const useVoucherFactory = () => {
    const [isStarting, setIsStarting] = useState(false);
    const [progresso, setProgresso] = useState<VoucherStatusDataType>({
        status_job: 'idle',
        processados: 0,
        total: 0,
        porcentagem: 0
    });

    // Ref para controlar o intervalo e evitar vazamento de memória
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- FUNÇÃO 1: Iniciar o Trabalho ---
    const iniciarProducao = async (qtd: number, produtoId: number, eventoId: number) => {
        setIsStarting(true);
        
        const response = await createVoucherGenerationJob({
            id_evento: eventoId,
            id_produto: produtoId,
            quantidade: qtd
        });

        setIsStarting(false);

        if (response.status === 'success') {
            console.log("Job criado com sucesso via Service. ID:", response.job_id);
            monitorarProgresso(); // Começa a observar
        } else {
            alert(`Erro: ${response.message}`);
        }
    };

    // --- FUNÇÃO 2: Consultar API (Polling) ---
    const checarStatus = useCallback(async () => {
        const response = await getVoucherGenerationStatus();

        if (response.status === 'success' && response.data) {
            setProgresso(response.data);

            // Regra de Parada: Se acabou ou deu erro, limpa o intervalo
            if (response.data.status_job === 'concluido' || response.data.status_job === 'erro') {
                if (pollingRef.current) clearInterval(pollingRef.current);
            }
        } else {
            // Se a API falhar (ex: rede), loga mas continua tentando (ou para, dependendo da regra)
            console.warn("Falha no polling:", response.message);
        }
    }, []);

    // --- FUNÇÃO 3: Ativar o Loop ---
    const monitorarProgresso = useCallback(() => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        
        // Chama uma vez imediatamente
        checarStatus();
        
        // Define o intervalo (2 segundos)
        pollingRef.current = setInterval(checarStatus, 2000);
    }, [checarStatus]);

    // --- EFEITO: Verifica status ao abrir a página (Resiliência a F5) ---
    useEffect(() => {
        // Ao montar, verifica se já tem algo rodando no backend
        monitorarProgresso();

        // Ao desmontar (sair da página), mata o intervalo do navegador
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [monitorarProgresso]);

    return {
        iniciarProducao,
        loadingRequest: isStarting,
        dados: progresso
    };
};