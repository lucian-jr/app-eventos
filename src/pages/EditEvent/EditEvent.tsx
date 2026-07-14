import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Delete } from "@mui/icons-material";

import type { DevicesType, EventDeviceType } from '../../services/events/events.types';
import { getEvent, putEvent } from '../../services/events/events.service';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/Loader/Loader';

const EditEvent = () => {
	const { id: eventId } = useParams();
	const { user } = useAuth();
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [eventName, setEventName] = useState("");
	const [eventDate, setEventDate] = useState("");
	const [eventDateEnd, setEventDateEnd] = useState("");
	const [eventLogin, setEventLogin] = useState("");
	const [eventSenha, setEventSenha] = useState("");
	const [showEventLogin, setShowEventLogin] = useState(true);

	const [existingDevices, setExistingDevices] = useState<EventDeviceType[]>([]);
	const [newDevices, setNewDevices] = useState<DevicesType[]>([]);
	const [products, setProducts] = useState<{ name: string; value: string }[]>([]);

	const [numeroImpressora, setNumeroImpressora] = useState("");
	const [operador, setOperador] = useState("");

	useEffect(() => {
		const fetchEvent = async () => {
			if (!user || !eventId) return;

			setIsLoading(true);
			const res = await getEvent(parseInt(eventId), user.id);

			if (res.status !== 'success' || !res.event_data) {
				setError(res.message || 'Evento não encontrado.');
				setIsLoading(false);
				return;
			}

			const event = res.event_data;

			setEventName(event.nome);
			setEventDate(event.data_evento?.split(' ')[0] || event.data_evento);
			setEventDateEnd(event.data_fim?.split(' ')[0] || event.data_fim || '');
			setEventLogin(event.login_evento || '');
			setEventSenha(event.senha_evento || '');
			setExistingDevices(event.devices || []);
			setProducts(event.products?.map(p => ({ name: p.name, value: p.value })) || []);

			const hasLeitor = event.devices?.some(d => d.name === 'Leitor + impressora');
			const hasEventLogin = !!(event.login_evento || event.senha_evento);
			setShowEventLogin(hasLeitor || hasEventLogin);

			setIsLoading(false);
		};

		fetchEvent();
	}, [eventId, user]);

	const handleOperadorChange = (deviceId: number, value: string) => {
		setExistingDevices(prev =>
			prev.map(d => d.id === deviceId ? { ...d, operador: value } : d)
		);
	};

	const addMaquininha = () => {
		if (!numeroImpressora) {
			setError("Informe o número da impressora para a Maquininha!");
			return;
		}

		const allImpressoras = [
			...existingDevices.filter(d => d.name === 'Maquininha PDV').map(d => d.numero_impressora),
			...newDevices.map(d => d.numero_impressora),
		];

		if (allImpressoras.includes(numeroImpressora)) {
			setError(`A Maquininha com a impressora nº ${numeroImpressora} já foi inserida!`);
			return;
		}

		const newDevice: DevicesType = {
			name: 'Maquininha PDV',
			number: '',
			numero_impressora: numeroImpressora,
			operador: operador ? operador.trim() : null,
		};

		setNewDevices(prev => [...prev, newDevice]);
		setNumeroImpressora("");
		setOperador("");
		setError("");
	};

	const removeNewDevice = (indexToRemove: number) => {
		setNewDevices(prev => prev.filter((_, index) => index !== indexToRemove));
	};

	const updateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (!eventName || !eventDate || !eventDateEnd || !eventId) {
			setError("Preencha os campos obrigatórios.");
			setLoading(false);
			return;
		}

		if (eventDateEnd < eventDate) {
			setError("A data final não pode ser anterior à data de início.");
			setLoading(false);
			return;
		}

		if (showEventLogin && (!eventLogin || !eventSenha)) {
			setError("Preencha login e senha do evento.");
			setLoading(false);
			return;
		}

		const operadores_update = existingDevices
			.filter(d => d.name === 'Maquininha PDV' && d.id_usuario)
			.map(d => ({
				id_usuario: d.id_usuario!,
				operador: d.operador?.trim() || null,
			}));

		const res = await putEvent({
			user_id: user?.id,
			id: parseInt(eventId),
			nome: eventName,
			data_evento: eventDate,
			data_fim: eventDateEnd,
			login_evento: showEventLogin ? eventLogin : '',
			senha_evento: showEventLogin ? eventSenha : '',
			new_devices: newDevices,
			operadores_update,
		});

		if (res.status !== 'success') {
			setError(res.message);
			setLoading(false);
			return;
		}

		alert('Evento atualizado com sucesso!');
		navigate(`/dashboard/${eventId}`, { replace: true });
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[60vh]">
				<Loader />
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="font-bold text-[20px]">EDITAR EVENTO</h1>
				<button
					type="button"
					className="btn btn--filled-mid-green"
					onClick={() => navigate(`/dashboard/${eventId}`)}
				>
					VOLTAR
				</button>
			</div>

			{error && <p className="msg error-msg mb-4">{error}</p>}

			<form onSubmit={updateEvent}>
				<div className="flex gap-5 mb-2">
					<input
						className="px-7 h-9 w-full"
						type="text"
						name="nome"
						placeholder="Nome do evento"
						value={eventName}
						onChange={(e) => setEventName(e.target.value)}
						required
					/>
				</div>
				<div className="flex gap-5 mb-2">
					<div className="w-[50%]">
						<label className="block text-sm font-semibold mb-1 text-gray-600">Data de início</label>
						<input
							className="h-9 w-full px-3"
							type="date"
							name="data_evento"
							value={eventDate}
							onChange={(e) => setEventDate(e.target.value)}
							required
						/>
					</div>
					<div className="w-[50%]">
						<label className="block text-sm font-semibold mb-1 text-gray-600">Data final</label>
						<input
							className="h-9 w-full px-3"
							type="date"
							name="data_fim"
							value={eventDateEnd}
							min={eventDate || undefined}
							onChange={(e) => setEventDateEnd(e.target.value)}
							required
						/>
					</div>
				</div>

				{showEventLogin && (
					<div className="flex gap-5 mb-8">
						<input
							className="px-7 h-9 w-[50%]"
							type="text"
							name="login"
							placeholder="Login"
							value={eventLogin}
							onChange={(e) => setEventLogin(e.target.value)}
							required
						/>

						<input
							className="px-7 h-9 w-[50%]"
							type="text"
							name="senha"
							placeholder="Senha"
							value={eventSenha}
							onChange={(e) => setEventSenha(e.target.value)}
							required
						/>
					</div>
				)}

				<h2 className="font-bold text-[20px] mb-4">Pontos de devolução cadastrados</h2>

				<div className="mb-8">
					{existingDevices.length > 0 ? (
						existingDevices.map((device) => (
							<div key={device.id} className="mb-4 p-4 bg-[#f3f3f3] rounded-lg">
								<p className="font-bold text-[14px] mb-2">
									{device.name} {device.number || device.numero_impressora}
								</p>

								{device.name === 'Maquininha PDV' && (
									<input
										className="px-7 h-9 w-full"
										type="text"
										placeholder="Nome do operador"
										value={device.operador ?? ""}
										onChange={(e) => device.id && handleOperadorChange(device.id, e.target.value)}
										maxLength={200}
									/>
								)}
							</div>
						))
					) : (
						<p className="font-bold text-[14px] text-gray-500">Nenhum dispositivo cadastrado.</p>
					)}
				</div>

				<h2 className="font-bold text-[20px] mb-4">Adicionar maquininha PDV</h2>

				<div className="flex gap-6 mb-8">
					<input
						className="h-9"
						type="text"
						name="numero_impressora"
						placeholder="Ex: 000303"
						value={numeroImpressora}
						onChange={(e) => setNumeroImpressora(e.target.value)}
					/>
					<input
						className="px-7 h-9"
						type="text"
						name="operador"
						placeholder="Nome do operador"
						value={operador}
						onChange={(e) => setOperador(e.target.value)}
						maxLength={200}
					/>
					<button type="button" className="btn btn--filled-mid-green" onClick={addMaquininha}>
						ADICIONAR
					</button>
				</div>

				{newDevices.length > 0 && (
					<div className="mb-8">
						{newDevices.map((device, idx) => (
							<p key={idx} className="font-bold text-[14px]">
								{device.name} {device.numero_impressora}{device.operador ? ` - ${device.operador}` : ''}
								<button
									type="button"
									className="ml-2.5 text-red-700"
									onClick={() => removeNewDevice(idx)}
								>
									<Delete />
								</button>
							</p>
						))}
					</div>
				)}

				<h2 className="font-bold text-[20px] mb-4">Produtos do evento</h2>

				<div className="mb-10">
					{products.length > 0 ? (
						products.map((product, idx) => (
							<p key={idx} className="font-bold text-[14px] mb-2 text-gray-600">
								{product.name} — R${product.value}
							</p>
						))
					) : (
						<p className="font-bold text-[14px] text-gray-500">Sem produtos registrados.</p>
					)}
				</div>

				<div className="flex justify-center gap-4">
					<button
						type="button"
						className="btn"
						onClick={() => navigate(`/dashboard/${eventId}`)}
					>
						CANCELAR
					</button>
					<button type="submit" className="btn btn--filled-mid-green" disabled={loading}>
						SALVAR ALTERAÇÕES
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditEvent;
