import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { DeleteButton } from '../../components/DeleteButton/DeleteButton';
import { useAppAlert } from '../../components/Alert/Alert';

import type { DevicesType, EventDeviceType, NotebookPayloadType } from '../../services/events/events.types';
import { getEvent, putEvent } from '../../services/events/events.service';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/Loader/Loader';
import { adminTokenFromSearch, pathWithAdmin, adminRequestUserId } from '../../utils/adminAccess';

type ReaderForm = {
	id?: number
	number: string
	isNew?: boolean
}

type NotebookForm = {
	key: string
	id?: number
	id_usuario?: number | null
	login: string
	senha: string
	readers: ReaderForm[]
	isNew?: boolean
}

const numeroLeitor = (valor: string) => {
	const digits = valor.replace(/\D/g, '');
	if (!digits) return '';
	return digits.padStart(2, '0');
}

const EditEvent = () => {
	const { id: eventId } = useParams();
	const [searchParams] = useSearchParams();
	const adminToken = adminTokenFromSearch(searchParams.toString());
	const { user } = useAuth();
	const navigate = useNavigate();
	const { notify } = useAppAlert();

	const [isLoading, setIsLoading] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [eventName, setEventName] = useState("");
	const [idPedido, setIdPedido] = useState("");
	const [eventDate, setEventDate] = useState("");
	const [eventDateEnd, setEventDateEnd] = useState("");
	const [eventLogin, setEventLogin] = useState("");
	const [eventSenha, setEventSenha] = useState("");
	const [showEventLogin, setShowEventLogin] = useState(true);

	const [existingDevices, setExistingDevices] = useState<EventDeviceType[]>([]);
	const [legacyReaders, setLegacyReaders] = useState<EventDeviceType[]>([]);
	const [notebooks, setNotebooks] = useState<NotebookForm[]>([]);
	const [numeroLeitorDraft, setNumeroLeitorDraft] = useState<Record<string, string>>({});
	const [newDevices, setNewDevices] = useState<DevicesType[]>([]);
	const [products, setProducts] = useState<{ name: string; value: string }[]>([]);
	const [temVouchers, setTemVouchers] = useState(false);

	const [numeroImpressora, setNumeroImpressora] = useState("");
	const [operador, setOperador] = useState("");

	const showError = (message: string) => {
		void notify({
			title: 'Atenção',
			message,
			variant: 'error',
		});
	};

	useEffect(() => {
		const fetchEvent = async () => {
			if (!eventId || (!user && !adminToken)) {
				setError('Você não tem acesso a este evento.');
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setHasAccess(false);
			const res = await getEvent(parseInt(eventId), adminRequestUserId(user?.id, adminToken), adminToken);

			if (res.status !== 'success' || !res.event_data) {
				setError(res.message || 'Você não tem acesso a este evento.');
				setIsLoading(false);
				return;
			}

			const event = res.event_data;

			setEventName(event.nome);
			setIdPedido(event.id_pedido == null ? '' : String(event.id_pedido));
			setEventDate(event.data_evento?.split(' ')[0] || event.data_evento);
			setEventDateEnd(event.data_fim?.split(' ')[0] || event.data_fim || '');
			setEventLogin(event.login_evento || '');
			setEventSenha(event.senha_evento || '');
			setProducts(event.products?.map(p => ({ name: p.name, value: p.value })) || []);
			setTemVouchers(!!event.tem_vouchers);

			const devices = event.devices || [];
			const notebookDevices = devices.filter(d => d.name === 'Notebook');
			const readerDevices = devices.filter(d => d.name === 'Leitor + impressora');
			setExistingDevices(devices.filter(d => d.name === 'Maquininha PDV'));
			setLegacyReaders(readerDevices.filter(d => !d.id_notebook));
			setNotebooks(notebookDevices.map((notebook) => ({
				key: `nb-${notebook.id}`,
				id: notebook.id,
				id_usuario: notebook.id_usuario,
				login: notebook.login || '',
				senha: notebook.senha || '',
				readers: readerDevices
					.filter(reader => Number(reader.id_notebook) === Number(notebook.id))
					.map(reader => ({ id: reader.id, number: reader.number || '' })),
				isNew: false,
			})));

			const hasLegacyLeitor = readerDevices.some(d => !d.id_notebook);
			const hasEventLogin = !!(event.login_evento || event.senha_evento);
			setShowEventLogin(notebookDevices.length === 0 && (hasLegacyLeitor || hasEventLogin));

			setHasAccess(true);
			setIsLoading(false);
		};

		fetchEvent();
	}, [eventId, user, adminToken]);

	const handleOperadorChange = (deviceId: number, value: string) => {
		setExistingDevices(prev =>
			prev.map(d => d.id === deviceId ? { ...d, operador: value } : d)
		);
	};

	const addMaquininha = () => {
		if (!numeroImpressora) {
			showError("Informe o número da impressora para a Maquininha!");
			return;
		}

		const allImpressoras = [
			...existingDevices.filter(d => d.name === 'Maquininha PDV').map(d => d.numero_impressora),
			...newDevices.map(d => d.numero_impressora),
		];

		if (allImpressoras.includes(numeroImpressora)) {
			showError(`A Maquininha com a impressora nº ${numeroImpressora} já foi inserida!`);
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
	};

	const removeNewDevice = (indexToRemove: number) => {
		setNewDevices(prev => prev.filter((_, index) => index !== indexToRemove));
	};

	const updateNotebook = (key: string, field: 'login' | 'senha', value: string) => {
		setNotebooks(prev => prev.map(notebook => (
			notebook.key === key ? { ...notebook, [field]: value } : notebook
		)));
	};

	const addNotebook = () => {
		setNotebooks(prev => [...prev, {
			key: `new-${Date.now()}`,
			login: '',
			senha: '',
			readers: [],
			isNew: true,
		}]);
	};

	const removeNewNotebook = (key: string) => {
		setNotebooks(prev => prev.filter(notebook => notebook.key !== key));
	};

	const addReader = (key: string) => {
		const numero = numeroLeitor(numeroLeitorDraft[key] || '');
		if (!numero) {
			showError("Informe o número do leitor.");
			return;
		}

		const notebook = notebooks.find(item => item.key === key);
		if (notebook?.readers.some(reader => reader.number === numero)) {
			showError(`O leitor ${numero} já existe neste computador.`);
			return;
		}

		setNotebooks(prev => prev.map(item => (
			item.key === key
				? { ...item, readers: [...item.readers, { number: numero, isNew: true }] }
				: item
		)));
		setNumeroLeitorDraft(prev => ({ ...prev, [key]: '' }));
	};

	const removeNewReader = (key: string, readerIndex: number) => {
		setNotebooks(prev => prev.map(item => (
			item.key === key
				? { ...item, readers: item.readers.filter((_, index) => index !== readerIndex) }
				: item
		)));
	};

	const updateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		if (!eventName || !eventDate || !eventDateEnd || !eventId) {
			showError("Preencha os campos obrigatórios.");
			setLoading(false);
			return;
		}

		if (eventDateEnd < eventDate) {
			showError("A data final não pode ser anterior à data de início.");
			setLoading(false);
			return;
		}

		if (showEventLogin && (!eventLogin || !eventSenha)) {
			showError("Preencha login e senha do evento.");
			setLoading(false);
			return;
		}

		const logins = new Set<string>();
		for (const notebook of notebooks) {
			const login = notebook.login.trim();
			const senha = notebook.senha.trim();
			if (!login || !senha) {
				showError("Informe login e senha de cada computador.");
				setLoading(false);
				return;
			}
			if (logins.has(login.toLowerCase())) {
				showError(`O login "${login}" está repetido entre os computadores.`);
				setLoading(false);
				return;
			}
			logins.add(login.toLowerCase());
			if (notebook.readers.length === 0) {
				showError("Cada computador precisa de pelo menos um leitor.");
				setLoading(false);
				return;
			}
			if (notebook.isNew && temVouchers) {
				showError("Não é possível incluir computador depois que os vouchers já foram gerados.");
				setLoading(false);
				return;
			}
		}

		const operadores_update = existingDevices
			.filter(d => d.name === 'Maquininha PDV' && d.id_usuario)
			.map(d => ({
				id_usuario: d.id_usuario!,
				operador: d.operador?.trim() || null,
			}));

		const notebooks_update = notebooks
			.filter(notebook => notebook.id && notebook.id_usuario)
			.map(notebook => ({
				id_usuario: notebook.id_usuario!,
				login: notebook.login.trim(),
				senha: notebook.senha.trim(),
			}));

		const new_readers = notebooks
			.filter(notebook => notebook.id)
			.flatMap(notebook => notebook.readers
				.filter(reader => reader.isNew)
				.map(reader => ({
					id_notebook: notebook.id!,
					number: reader.number,
				})));

		const new_notebooks: NotebookPayloadType[] = notebooks
			.filter(notebook => notebook.isNew)
			.map(notebook => ({
				login: notebook.login.trim(),
				senha: notebook.senha.trim(),
				leitores: notebook.readers.map(reader => ({ number: reader.number })),
			}));

		const res = await putEvent({
			user_id: user?.id,
			id: parseInt(eventId),
			nome: eventName,
			id_pedido: idPedido.trim() || null,
			data_evento: eventDate,
			data_fim: eventDateEnd,
			login_evento: showEventLogin ? eventLogin : '',
			senha_evento: showEventLogin ? eventSenha : '',
			new_devices: newDevices,
			operadores_update,
			notebooks_update,
			new_readers,
			new_notebooks,
		}, adminToken);

		if (res.status !== 'success') {
			showError(res.message || 'Não foi possível atualizar o evento.');
			setLoading(false);
			return;
		}

		await notify({
			title: 'Evento atualizado',
			message: 'Evento atualizado com sucesso!',
			variant: 'success',
		});
		navigate(pathWithAdmin(`/dashboard/${eventId}`, adminToken), { replace: true });
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[60vh]">
				<Loader />
			</div>
		);
	}

	if (!hasAccess) {
		return (
			<div>
				<p className="msg error-msg mb-4">{error || 'Você não tem acesso a este evento.'}</p>
				<button type="button" className="btn btn--filled-mid-green" onClick={() => navigate('/')}>
					VOLTAR
				</button>
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
					onClick={() => navigate(pathWithAdmin(`/dashboard/${eventId}`, adminToken))}
				>
					VOLTAR
				</button>
			</div>

			<form onSubmit={updateEvent}>
				<div className="flex gap-5 mb-2">
					<input
						className="px-7 h-9 w-[70%] min-w-0"
						type="text"
						name="nome"
						placeholder="Nome do evento"
						value={eventName}
						onChange={(e) => setEventName(e.target.value)}
						required
					/>
					<input
						className="px-7 h-9 w-[30%] min-w-0"
						type="text"
						name="id_pedido"
						placeholder="Número do pedido do evento (se houver)"
						value={idPedido}
						onChange={(e) => setIdPedido(e.target.value)}
					/>
				</div>
				<div className="flex gap-5 mt-4 mb-2">
					<div className="w-[50%]">
						<label className="block text-sm font-semibold mb-1! text-gray-600">Data de início</label>
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
						<label className="block text-sm font-semibold mb-1! text-gray-600">Data final</label>
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
					{notebooks.map((notebook, notebookIndex) => (
						<div key={notebook.key} className="mb-4 form-card p-4">
							<div className="mb-4 flex items-center justify-between">
								<p className="font-bold text-[16px]">Computador {notebookIndex + 1}</p>
								{notebook.isNew && (
									<DeleteButton onClick={() => removeNewNotebook(notebook.key)} label={`Excluir Computador ${notebookIndex + 1}`} />
								)}
							</div>
							<div className="mb-4 flex gap-4">
								<input
									className="px-7 h-9 w-[50%]"
									type="text"
									placeholder="Login"
									value={notebook.login}
									onChange={(e) => updateNotebook(notebook.key, 'login', e.target.value)}
								/>
								<input
									className="px-7 h-9 w-[50%]"
									type="text"
									placeholder="Senha"
									value={notebook.senha}
									onChange={(e) => updateNotebook(notebook.key, 'senha', e.target.value)}
								/>
							</div>
							<div className="mb-4 flex gap-4">
								<span className="flex h-9 items-center rounded-lg bg-white px-4 text-sm font-semibold text-gray-700">
									Adicionar leitor + impressora
								</span>
								<input
									className="h-9"
									type="text"
									placeholder="Número"
									value={numeroLeitorDraft[notebook.key] || ''}
									onChange={(e) => setNumeroLeitorDraft(prev => ({ ...prev, [notebook.key]: e.target.value }))}
								/>
								<button type="button" className="btn btn--filled-mid-green" onClick={() => addReader(notebook.key)}>
									ADICIONAR
								</button>
							</div>
							<div className="flex flex-wrap gap-3">
								{notebook.readers.map((reader, readerIndex) => (
									<div key={`${reader.number}-${readerIndex}`} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2">
										<span className="font-bold text-[14px]">Maquina {readerIndex + 1} - {reader.number}</span>
										{reader.isNew && (
											<DeleteButton
												onClick={() => removeNewReader(notebook.key, readerIndex)}
												label={`Excluir leitor ${reader.number}`}
											/>
										)}
									</div>
								))}
							</div>
						</div>
					))}

					{legacyReaders.map((device) => (
						<div key={device.id} className="mb-3 form-card px-4 py-3">
							<p className="font-bold text-[14px]">Leitor + impressora {device.number}</p>
						</div>
					))}

					{existingDevices.map((device) => (
						<div key={device.id} className="mb-4 form-card p-4">
							<p className="mb-2 font-bold text-[14px]">
								{device.name} {device.numero_impressora}
							</p>
							<input
								className="h-9 w-full px-7"
								type="text"
								placeholder="Nome do operador"
								value={device.operador ?? ""}
								onChange={(e) => device.id && handleOperadorChange(device.id, e.target.value)}
								maxLength={200}
							/>
						</div>
					))}

					{notebooks.length === 0 && legacyReaders.length === 0 && existingDevices.length === 0 && (
						<p className="font-bold text-[14px] text-gray-500">Nenhum dispositivo cadastrado.</p>
					)}
				</div>

				{!temVouchers && (
					<div className="mb-8">
						<button type="button" className="btn btn--filled-mid-green" onClick={addNotebook}>
							ADICIONAR COMPUTADOR
						</button>
					</div>
				)}

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
							<div key={idx} className="mb-3 flex items-center justify-between form-card px-4 py-3">
								<p className="font-bold text-[14px]">
									{device.name} {device.numero_impressora}{device.operador ? ` - ${device.operador}` : ''}
								</p>
								<DeleteButton onClick={() => removeNewDevice(idx)} label="Excluir maquininha" />
							</div>
						))}
					</div>
				)}

				<h2 className="font-bold text-[20px] mb-4">Produtos do evento</h2>

				<div className="mb-10">
					{products.length > 0 ? (
						products.map((product, idx) => (
							<div key={idx} className="mb-3 form-card px-4 py-3">
								<p className="font-bold text-[14px]">{product.name} — R${product.value}</p>
							</div>
						))
					) : (
						<p className="font-bold text-[14px] text-gray-500">Sem produtos registrados.</p>
					)}
				</div>

				<div className="flex justify-center gap-4">
					<button
						type="button"
						className="btn"
						onClick={() => navigate(pathWithAdmin(`/dashboard/${eventId}`, adminToken))}
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
