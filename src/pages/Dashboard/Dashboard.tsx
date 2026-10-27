import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import './Dashboard.css'

import { Loader } from "../../components/Loader/Loader";
import { VoucherProgress } from "../../components/VouchersProgress/VouchersProgress";

import type { EventType } from "../../services/events/events.types";
import type { DashboardDataType } from "../../services/dashboard/dashboard.types";

import { getEvent } from "../../services/events/events.service";
import { useAuth } from "../../context/AuthContext";
import { getDashboardData } from "../../services/dashboard/dashboard.service";
import { useVoucherFactory } from "../../hooks/useVoucherFactory";

import { formatEventDateRange } from "../../utils/date.utils";
import { adminTokenFromSearch, pathWithAdmin, adminRequestUserId } from "../../utils/adminAccess";

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
	const [searchParams] = useSearchParams();
	const adminToken = adminTokenFromSearch(searchParams.toString());
	const navigate = useNavigate();
	const { user } = useAuth();
	const [event, setEvent] = useState<EventType | null>(null)
	const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(null)
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [accessError, setAccessError] = useState("");

	const [selectedDeviceForLogin, setSelectedDeviceForLogin] = useState<any | null>(null);

	const { dados: progressoVouchers } = useVoucherFactory(event ? event.id : undefined, user?.id, adminToken);

	const fetchDataEvent = async () => {
		if (!event_id || (!user && !adminToken)) {
			setAccessError('Você não tem acesso a este evento.');
			setIsLoadingData(false);
			return;
		}

		const requestUserId = adminRequestUserId(user?.id, adminToken);

		setIsLoadingData(true);
		setAccessError("");
		setEvent(null);
		setDashboardData(null);

		try {
			const res = await getEvent(parseInt(event_id), requestUserId, adminToken);
			const eventOk = res.status == 'success' && !!res.event_data;

			if (eventOk && res.event_data) {
				setEvent(res.event_data);
			}

			const resDashboardData = await getDashboardData(parseInt(event_id), requestUserId, adminToken);

			if (resDashboardData.status == 'success') {
				setDashboardData(resDashboardData.dashboard_data);
			} else if (!eventOk) {
				setAccessError(res.message || resDashboardData.message || 'Você não tem acesso a este evento.');
			}
		} catch (error) {
			console.error("Erro ao buscar dados:", error);
		} finally {
			setIsLoadingData(false);
		}
	}

	useEffect(() => {
		fetchDataEvent();
	}, [event_id, user, adminToken]);

	const getQrCodeData = (device: any) => {
		const payload = {
			username: device.login,
			password: device.senha
		};
		return JSON.stringify(payload);
	};

	function PieChart({ devolucoes, resgates }: { devolucoes: number; resgates: number }) {
		const naoResgatados = Math.max(0, devolucoes - resgates);

		const data: ChartData<'pie'> = {
			labels: ['Não resgatados', 'Resgatados'],
			datasets: [
				{
					label: "%",
					data: [naoResgatados, resgates],
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
				legend: { display: false },
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

	const notebooks = (dashboardData?.devices_data || [])
		.filter((device) => device.nome === 'Notebook')
		.sort((a, b) => Number(a.id) - Number(b.id));
	const looseDevices = (dashboardData?.devices_data || [])
		.filter((device) => device.nome !== 'Notebook' && !device.id_notebook);

	const renderDeviceCard = (device: (typeof notebooks)[number], title: string) => (
		<div className="device" key={device.id}>
			<div className="flex justify-between items-start mb-3">
				<h3>
					{title}
					{device.operador && <span className="block text-sm font-normal text-gray-600 mt-1">Operador: {device.operador}</span>}
				</h3>
			</div>

			{Object.entries(device.vouchers_produto || {}).map(([productId, qtd]) => {
				const product = dashboardData?.products_data.find(
					(p) => String(p.id) === String(productId)
				);

				return (
					<div key={productId}>
						<div className="metric">
							<div className="label">{product?.nome ?? `Produto ${productId}`}</div>
							<div className="val">{qtd}</div>
						</div>
					</div>
				);
			})}

			{device.codigo_impressora && device.login ? (
				<div
					className="login-device cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-2 px-2 py-1 rounded border border-gray-200"
					onClick={() => setSelectedDeviceForLogin(device)}
					title="Gerar QR Code de Login"
				>
					<QrCode2 fontSize="small" />
					<span className="text-sm font-semibold">Fazer login</span>
				</div>
			) : null}
		</div>
	);

	if (isLoadingData) {
		return (
			<div className="flex justify-center items-center h-[80vh]">
				<Loader />
			</div>
		);
	}

	if (accessError) {
		return (
			<div>
				<p className="msg error-msg mb-4">{accessError}</p>
				<button type="button" className="btn btn--filled-mid-green" onClick={() => navigate('/')}>
					VOLTAR
				</button>
			</div>
		);
	}

	return (
		<div>
			{dashboardData ?
				<div>
					<div className="page-head">
						<h1 className="page-title">{[event?.nome, formatEventDateRange(event?.data_evento, event?.data_fim)].filter(Boolean).join(' – ') || `Evento ${event_id}`}</h1>
						<button className="btn-refresh" onClick={() => navigate(pathWithAdmin(`/edit-event/${event_id}`, adminToken))}>EDITAR EVENTO</button>
					</div>

					<div className="flex justify-between items-center title-row">
						<h2 className="section-title">Dados do evento</h2>
						<button className="btn-refresh" onClick={fetchDataEvent}>ATUALIZAR DADOS</button>
					</div>

					{dashboardData.user?.login && !dashboardData.user.login.startsWith('pdv_') && notebooks.length === 0 && (
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

					<div className="flex flex-col gap-4">
						{notebooks.map((notebook, notebookIndex) => {
							const readers = (dashboardData.devices_data || [])
								.filter((device) => Number(device.id_notebook) === Number(notebook.id))
								.sort((a, b) => Number(a.id) - Number(b.id));

							return (
								<div key={notebook.id} className="rounded-[14px] bg-[#F3F3F3] p-4">
									<h3 className="mb-1 text-[18px] font-black">Computador {notebookIndex + 1}</h3>
									{(notebook.login || notebook.senha) && (
										<p className="mb-4 text-sm font-bold text-gray-700">
											Login: {notebook.login} · Senha: {notebook.senha}
										</p>
									)}
									<div className="devices">
										{readers.map((reader, readerIndex) => (
											renderDeviceCard(reader, `Maquina ${readerIndex + 1} - ${reader.number || ''}`)
										))}
									</div>
								</div>
							);
						})}

						{looseDevices.length > 0 && (
							<div className="devices">
								{looseDevices.map((device) => (
									renderDeviceCard(
										device,
										`${device.nome} - ${device.number || device.codigo_impressora || ''}`
									)
								))}
							</div>
						)}
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