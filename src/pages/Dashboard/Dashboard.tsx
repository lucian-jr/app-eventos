import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// CSS
import './Dashboard.css'

// Types
import type { EventType } from "../../services/events/events.types";
import type { DashboardDataType } from "../../services/dashboard/dashboard.types";

// API
import { getEvent } from "../../services/events/events.service";
import { useAuth } from "../../context/AuthContext";

// Chart.js
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

import { getDashboardData } from "../../services/dashboard/dashboard.service";
import { formatDBDate } from "../../utils/date.utils";

const Dashboard = () => {

	const { id: event_id } = useParams();
	const { user } = useAuth();
	const [event, setEvent] = useState<EventType | null>(null)
	const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(null)

	const fetchDataEvent = async () => {
		if (!user || !event_id) return;

		const res = await getEvent(parseInt(event_id), user.id);

		if (res.status == 'success') {
			// console.log(res)
			setEvent(res.event_data)
		}

		const resDashboardData = await getDashboardData(parseInt(event_id));

		if (resDashboardData.status == 'success') {
			console.log(resDashboardData)
			setDashboardData(resDashboardData.dashboard_data)
		}
	}

	useEffect(() => {
		fetchDataEvent();

	}, [event_id, user]);


	function PieChart({
		devolucoes,
		resgates,
	}: { devolucoes: number; resgates: number }) {

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
				legend: { position: 'bottom' as const }, // <- literal
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

	return (
		<div>
			{dashboardData ?
				<div>
					<div className="page-head">
						<h1 className="page-title">{event?.nome} – {formatDBDate(event?.data_evento)}</h1>
					</div>

					<div className="flex justify-between items-center">
						<h2 className="section-title">Total de devoluções por produto</h2>
						<button className="btn-refresh" onClick={fetchDataEvent}>ATUALIZAR DADOS</button>
					</div>


					<div className="flex gap-5 mb-10">
						{dashboardData && dashboardData.products_data.map((p, index) => (
							<div className="product-collumn">
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
								<h3>{d.nome} {d.number}</h3>

								{Object.entries(d.vouchers_produto).map(([productId, qtd]) => {
									const product = dashboardData.products_data.find(
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
							</div>
						))}
					</div>
				</div>
				:
				<p>Carregando...</p>
			}
		</div>
	)
}

export default Dashboard