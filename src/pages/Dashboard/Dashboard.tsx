import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import './Dashboard.css'

import { Loader } from "../../components/Loader/Loader";
import { VoucherProgress } from "../../components/VouchersProgress/VouchersProgress";

import type { EventType } from "../../services/events/events.types";
import type { DashboardDataType } from "../../services/dashboard/dashboard.types";

import { getEvent } from "../../services/events/events.service";
import { useAuth } from "../../context/AuthContext";
import { getDashboardData } from "../../services/dashboard/dashboard.service";
import { useVoucherFactory } from "../../hooks/useVoucherFactory";

import { formatDBDate } from "../../utils/date.utils";

import QRCode from "react-qr-code";
import { QrCode2, Close } from "@mui/icons-material";

import { Pie } from 'react-chartjs-2'
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	type ChartOptions,
	type ChartData,
	type TooltipItem,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {

	const { id: event_id } = useParams();
	const { user } = useAuth();
	const [event, setEvent] = useState<EventType | null>(null)
	const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(null)
	const [isLoadingData, setIsLoadingData] = useState(true);

	const [selectedDeviceForLogin, setSelectedDeviceForLogin] = useState<any | null>(null);

	const { dados: progressoVouchers } = useVoucherFactory(event ? event.id : undefined);

	const fetchDataEvent = async () => {
		if (!user || !event_id) return;

		setIsLoadingData(true);

		try {
			const res = await getEvent(parseInt(event_id), user.id);

			if (res.status == 'success') {
				setEvent(res.event_data)
			}

			const resDashboardData = await getDashboardData(parseInt(event_id));

			if (resDashboardData.status == 'success') {
				setDashboardData(resDashboardData.dashboard_data)
			}
		} catch (error) {
			console.error("Erro ao buscar dados:", error);
		} finally {
			setIsLoadingData(false);
		}
	}

	useEffect(() => {
		fetchDataEvent();
	}, [event_id, user]);

	const getQrCodeData = (device: any) => {
		const payload = {
			username: device.login,
			password: device.senha
		};
		return JSON.stringify(payload);
	};

	function PieChart({ devolucoes, resgates }: { devolucoes: number; resgates: number }) {
		const data: ChartData<'pie'> = {
			datasets: [
				{
					label: "%",
					data: [devolucoes, resgates],
					backgroundColor: ["rgb(2, 123, 139)", "rgb(65, 201, 130)"],
					borderWidth: 0,
					hoverOffset: 4,
				},
			],
		};

		const options: ChartOptions<'pie'> = {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { position: 'bottom' as const },
				tooltip: {
					callbacks: {
						label: (ctx: TooltipItem<'pie'>) => {
							const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
							const val = ctx.parsed as number;
							const pct = total ? ((val / total) * 100).toFixed(1) : '0.0';
							return `${ctx.label}: ${val} (${pct}%)`;
						},
					},
				},
			},
		};

		return (
			<div style={{ height: 260 }}>
				<Pie data={data} options={options} />
			</div>
		);
	}

	if (isLoadingData) {
		return (
			<div className="flex justify-center items-center h-[80vh]">
				<Loader />
			</div>
		);
	}

	return (
		<div>
			{dashboardData ?
				<div>
					<div className="page-head">
						<h1 className="page-title">{event?.nome} – {formatDBDate(event?.data_evento)}</h1>
					</div>

					<div className="flex justify-between items-center title-row">
						<h2 className="section-title">Dados do evento</h2>
						<button className="btn-refresh" onClick={fetchDataEvent}>ATUALIZAR DADOS</button>
					</div>

					{dashboardData.user.login && !dashboardData.user.login.startsWith('pdv_') && (
						<div className="pill-collum flex">
							<div className="mr-10"><strong>Login:</strong> {dashboardData.user.login}</div>
							<div><strong>Senha:</strong> {dashboardData.user.senha}</div>
						</div>
					)}

					<VoucherProgress dados={progressoVouchers} />

					<div className="flex justify-between items-center title-row">
						<h2 className="section-title">Total de devoluções por produto</h2>
					</div>

					<div className="flex gap-5 mb-10 grid-products">
						{dashboardData.products_data.map((p, index) => (
							<div key={index} className="product-collumn">
								<div className="pill">
									<div className="label"><span className="badge">{p.nome}</span></div>
									<div>{p.total_devolucoes}</div>
								</div>

								<h2 className="section-title">{index === 0 && 'Total de resgate por produto'}</h2>

								<div className="pill">
									<div className="label"><span className="badge">{p.nome}</span></div>
									<div>{p.total_resgates}</div>
								</div>

								<div className="charts">
									<div className="chart-card">
										<span className="card-title">{p.nome}</span>
										<div className="chart-wrap">
											<PieChart
												devolucoes={p.total_devolucoes}
												resgates={p.total_resgates}
											/>
										</div>
										<div className="legend">
											<div className="legend-item black-color"><span className="dot"></span> Não resgatados:  {p.total_devolucoes - p.total_resgates}  ( {p.porcentagem_devolucoes} % )</div>
											<div className="legend-item black-color"><span className="dot alt"></span> Resgatados:  {p.total_resgates}  ( {p.porcentagem_resgates} %)</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					<h2 className="section-title">Total de vouchers impressos por dispositivo</h2>

					<div className="devices" >
						{dashboardData && dashboardData.devices_data.map((d, index) => (
							<div className="device" key={index}>

								{/* CABEÇALHO DO CARD: Título + Botão de Login (se existir) */}
								<div className="flex justify-between items-start mb-3">
									<h3>{d.nome} - {d.number || d.codigo_impressora}</h3>
								</div>

								{/* LISTA DE PRODUTOS */}
								{Object.entries(d.vouchers_produto).map(([productId, qtd]) => {
									const product = dashboardData.products_data.find(
										(p) => String(p.id) === String(productId)
									);

									return (
										<div key={productId}>
											<div className="metric">
												<div className="label">{product?.nome ?? `Produto ${productId}`}</div>
												<div className="val">{qtd}</div>
												{/* Botão de login REMOVIDO daqui */}
											</div>
										</div>
									);
								})}

								{d.codigo_impressora && d.login ? (
									<div
										className="login-device cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-2 px-2 py-1 rounded border border-gray-200"
										onClick={() => setSelectedDeviceForLogin(d)}
										title="Gerar QR Code de Login"
									>
										<QrCode2 fontSize="small" />
										<span className="text-sm font-semibold">Fazer login</span>
									</div>
								) : null}
							</div>
						))}
					</div>
				</div>
				:
				<p>Carregando...</p>
			}

			{selectedDeviceForLogin && (
				<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full relative flex flex-col items-center animate-in fade-in zoom-in duration-200">

						<button
							onClick={() => setSelectedDeviceForLogin(null)}
							className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
						>
							<Close />
						</button>

						<h3 className="text-lg font-bold mb-4 text-center">
							Login PDV <br />
							<span className="text-sm font-normal text-gray-600">
								{selectedDeviceForLogin.nome} ({selectedDeviceForLogin.codigo_impressora})
							</span>
						</h3>

						<div className="p-4 border-2 border-gray-100 rounded-lg bg-white">
							<QRCode
								value={getQrCodeData(selectedDeviceForLogin)}
								size={200}
								level="H"
							/>
						</div>

						<p className="mt-4 text-sm text-center text-gray-500">
							Aponte a câmera da maquininha para <br /> realizar o login automático.
						</p>
					</div>
				</div>
			)}
		</div>
	)
}

export default Dashboard