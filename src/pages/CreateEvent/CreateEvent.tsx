import { useState } from 'react';

import CurrencyInput from 'react-currency-input-field';

import { formataValor } from '../../utils/value.util';
import { DeleteButton } from '../../components/DeleteButton/DeleteButton';
import { useAppAlert } from '../../components/Alert/Alert';

import type { DevicesType, NotebookPayloadType, ProductsType, PostEventType } from '../../services/events/events.types';

import { postEvent } from '../../services/events/events.service';

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type NotebookForm = {
	login: string
	senha: string
	readers: { number: string }[]
}

const numeroLeitor = (valor: string) => {
	const digits = valor.replace(/\D/g, '');
	if (!digits) return '';
	return digits.padStart(2, '0');
}

const CreateEvent = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { notify, confirm } = useAppAlert();
	const [eventName, setEventName] = useState("");
	const [idPedido, setIdPedido] = useState("");
	const [eventDate, setEventDate] = useState("");
	const [eventDateEnd, setEventDateEnd] = useState("");
	const [productName, setProductName] = useState("");
	const [productValue, setProductValue] = useState("");
	const [products, setProducts] = useState<ProductsType[]>([]);
	const [material, setMaterial] = useState("");
	const [numeroImpressora, setNumeroImpressora] = useState("");
	const [operador, setOperador] = useState("");
	const [notebooks, setNotebooks] = useState<NotebookForm[]>([]);
	const [numeroLeitorDraft, setNumeroLeitorDraft] = useState<Record<number, string>>({});
	const [pdvs, setPdvs] = useState<DevicesType[]>([]);
	const [loading, setLoading] = useState(false);

	const pedeQuantidade = products.length > 0;

	const showError = (message: string) => {
		void notify({
			title: 'Atenção',
			message,
			variant: 'error',
		});
	};

	const addProduct = () => {
		if (!productName || !productValue) {
			showError("Preencha os campos do produto corretamente!");
			return;
		}

		const alreadyInsertedBefore = products.some((e) => e.name.toLocaleLowerCase() === productName.toLocaleLowerCase());

		if (alreadyInsertedBefore) {
			showError("Este produto já foi inserido anteriormente.");
			return;
		}

		setProducts(prev => [...prev, {
			name: productName,
			value: formataValor(productValue),
			quantity: null
		}]);
		setProductName("");
		setProductValue("");
	};

	const removeProduct = async (pName: string) => {
		const confirmDelete = await confirm({
			title: 'Excluir produto',
			message: `Tem certeza que deseja excluir o produto "${pName}"?`,
			confirmLabel: 'Excluir',
			tone: 'danger',
		});
		if (!confirmDelete) return;

		setProducts(prev => prev.filter(e => e.name.toLocaleLowerCase() !== pName.toLocaleLowerCase()));
	};

	const addMaterial = () => {
		if (material === 'Notebook') {
			setNotebooks(prev => [...prev, { login: '', senha: '', readers: [] }]);
			setMaterial("");
			return;
		}

		if (material !== 'Maquininha PDV') {
			showError("Selecione um computador ou uma maquininha.");
			return;
		}

		if (!numeroImpressora.trim()) {
			showError("Informe o número da impressora para a maquininha!");
			return;
		}

		if (pdvs.some((d) => d.numero_impressora === numeroImpressora.trim())) {
			showError(`A maquininha com a impressora nº ${numeroImpressora.trim()} já foi inserida!`);
			return;
		}

		setPdvs(prev => [...prev, {
			name: 'Maquininha PDV',
			number: '',
			numero_impressora: numeroImpressora.trim(),
			operador: operador.trim() || null,
		}]);
		setNumeroImpressora("");
		setOperador("");
		setMaterial("");
	};

	const addReader = (notebookIndex: number) => {
		const numero = numeroLeitor(numeroLeitorDraft[notebookIndex] || '');
		if (!numero) {
			showError("Informe o número do leitor.");
			return;
		}

		const repetido = notebooks[notebookIndex].readers.some((reader) => reader.number === numero);
		if (repetido) {
			showError(`O leitor ${numero} já foi inserido neste computador.`);
			return;
		}

		setNotebooks(prev => prev.map((notebook, index) => (
			index === notebookIndex
				? { ...notebook, readers: [...notebook.readers, { number: numero }] }
				: notebook
		)));
		setNumeroLeitorDraft(prev => ({ ...prev, [notebookIndex]: '' }));
	};

	const removeReader = (notebookIndex: number, readerIndex: number) => {
		setNotebooks(prev => prev.map((notebook, index) => (
			index === notebookIndex
				? { ...notebook, readers: notebook.readers.filter((_, idx) => idx !== readerIndex) }
				: notebook
		)));
	};

	const removeNotebook = (notebookIndex: number) => {
		setNotebooks(prev => prev.filter((_, index) => index !== notebookIndex));
	};

	const updateNotebook = (notebookIndex: number, field: 'login' | 'senha', value: string) => {
		setNotebooks(prev => prev.map((notebook, index) => (
			index === notebookIndex ? { ...notebook, [field]: value } : notebook
		)));
	};

	const handleQuantityChange = (prodName: string, qtyStr: string) => {
		const onlyDigits = qtyStr.replace(/\D/g, "");
		const qty = onlyDigits === "" ? null : Math.max(0, parseInt(onlyDigits, 10));

		setProducts(prev =>
			prev.map(p =>
				p.name.toLowerCase() === prodName.toLowerCase()
					? { ...p, quantity: qty }
					: p
			)
		);
	};

	const createEvent = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		if (!(products.length > 0 && eventName && eventDate && eventDateEnd)) {
			showError("Preencha o evento e adicione pelo menos um produto.");
			setLoading(false);
			return;
		}

		if (eventDateEnd < eventDate) {
			showError("A data final não pode ser anterior à data de início.");
			setLoading(false);
			return;
		}

		if (notebooks.length === 0 && pdvs.length === 0) {
			showError("Adicione um computador ou uma maquininha.");
			setLoading(false);
			return;
		}

		const logins = new Set<string>();
		for (let i = 0; i < notebooks.length; i++) {
			const notebook = notebooks[i];
			const login = notebook.login.trim();
			const senha = notebook.senha.trim();
			if (!login || !senha) {
				showError(`Informe login e senha do Computador ${i + 1}.`);
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
				showError(`O Computador ${i + 1} precisa de pelo menos um leitor.`);
				setLoading(false);
				return;
			}
		}

		if (pedeQuantidade && products.some((product) => !product.quantity || product.quantity <= 0)) {
			showError("Informe a quantidade de vouchers de cada produto.");
			setLoading(false);
			return;
		}

		const notebooksPayload: NotebookPayloadType[] = notebooks.map((notebook) => ({
			login: notebook.login.trim(),
			senha: notebook.senha.trim(),
			leitores: notebook.readers.map((reader) => ({ number: reader.number })),
		}));

		const eventData: PostEventType = {
			user_id: user?.id,
			nome: eventName,
			id_pedido: idPedido.trim() || null,
			data_evento: eventDate,
			data_fim: eventDateEnd,
			login_evento: '',
			senha_evento: '',
			notebooks: notebooksPayload,
			devices: pdvs,
			products: products,
		};

		const res = await postEvent(eventData);

		if (res.status !== 'success') {
			showError(res.message || 'Não foi possível criar o evento.');
			setLoading(false);
			return;
		}

		await notify({
			title: 'Evento criado',
			message: 'Evento criado com sucesso!',
			variant: 'success',
		});
		navigate(`/dashboard/${res.event_id}`, { replace: true });
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="font-bold text-[20px]">1. CRIAR EVENTO</h1>
			</div>

			<form onSubmit={createEvent}>
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
				<div className="flex gap-5 mt-4 mb-8">
					<div className="w-[50%]">
						<label className="block text-sm font-semibold mb-1! text-gray-600">Data início evento</label>
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
						<label className="block text-sm font-semibold mb-1! text-gray-600">Data fim evento</label>
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

				<h2 className="font-bold text-[20px] mb-4">2. ADICIONAR PRODUTO(S) COM CAUÇÃO</h2>

				<div className="flex gap-6 mb-4">
					<select
						className="px-7 h-9 w-[50%]"
						name="nome_produto"
						onChange={(e) => setProductName(e.target.value)}
						value={productName}
					>
						<option value="" disabled>Selecione o tipo de produto</option>
						<option value="Copo retornável">Copo retornável</option>
						<option value="Cartão Cashless">Cartão Cashless</option>
					</select>

					<CurrencyInput
						name="valor_produto"
						placeholder="Valor R$0,00"
						decimalsLimit={2}
						intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
						className="px-7 h-9 w-[50%] border rounded"
						value={productValue}
						onValueChange={(val) => setProductValue(val || "")}
					/>

					<button type="button" className="btn btn--filled-mid-green" onClick={addProduct}>ADICIONAR</button>
				</div>

				<div className="mb-8">
					{products.map((product) => (
						<div key={product.name} className="mb-3 flex items-center justify-between form-card px-4 py-3">
							<p className="font-bold text-[14px]">{product.name} R${product.value}</p>
							<DeleteButton onClick={() => removeProduct(product.name)} label={`Excluir ${product.name}`} />
						</div>
					))}
				</div>

				{pedeQuantidade && (
					<>
						<h2 className="font-bold text-[20px] mb-4">3. NÚMERO DE VOUCHERS NECESSÁRIOS PARA ESSE EVENTO</h2>
						<div className="mb-10">
							{products.map((product) => (
								<div key={product.name} className="mb-3 flex items-center justify-between form-card px-4 py-3">
									<p className="font-bold text-[14px]">{product.name} R${product.value}</p>
									<input
										className="px-7 h-9"
										type="text"
										name="produto_quantidade"
										placeholder="Quantidade"
										value={product.quantity ?? ""}
										onChange={(e) => handleQuantityChange(product.name, e.target.value)}
										required
									/>
								</div>
							))}
						</div>
					</>
				)}

				<h2 className="font-bold text-[20px] mb-4">4. ADICIONAR PONTO DE DEVOLUÇÃO</h2>

				<div className="flex gap-6 mb-4">
					<select
						name="material"
						className="px-7 h-9 w-[100%]"
						onChange={(e) => setMaterial(e.target.value)}
						value={material}
					>
						<option value="" disabled>Selecione o material (computador ou PDV)</option>
						<option value="Notebook">Computador</option>
						<option value="Maquininha PDV">Maquininha PDV</option>
					</select>

					{material === 'Maquininha PDV' && (
						<>
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
						</>
					)}

					<button type="button" className="btn btn--filled-mid-green" onClick={addMaterial}>ADICIONAR</button>
				</div>

				<div className="mb-8">
					{notebooks.map((notebook, notebookIndex) => (
						<div key={notebookIndex} className="mb-4 form-card p-4">
							<div className="mb-4 flex items-center justify-between">
								<p className="font-bold text-[16px]">Computador {notebookIndex + 1}</p>
								<DeleteButton
									onClick={() => removeNotebook(notebookIndex)}
									label={`Excluir Computador ${notebookIndex + 1}`}
								/>
							</div>

							<div className="mb-4 flex gap-4">
								<input
									className="px-7 h-9 w-[50%]"
									type="text"
									placeholder="Login"
									value={notebook.login}
									onChange={(e) => updateNotebook(notebookIndex, 'login', e.target.value)}
								/>
								<input
									className="px-7 h-9 w-[50%]"
									type="text"
									placeholder="Senha"
									value={notebook.senha}
									onChange={(e) => updateNotebook(notebookIndex, 'senha', e.target.value)}
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
									value={numeroLeitorDraft[notebookIndex] || ''}
									onChange={(e) => setNumeroLeitorDraft(prev => ({ ...prev, [notebookIndex]: e.target.value }))}
								/>
								<button type="button" className="btn btn--filled-mid-green" onClick={() => addReader(notebookIndex)}>
									ADICIONAR
								</button>
							</div>

							<div className="flex flex-wrap gap-3">
								{notebook.readers.map((reader, readerIndex) => (
									<div key={`${reader.number}-${readerIndex}`} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2">
										<span className="font-bold text-[14px]">Maquina {readerIndex + 1} - {reader.number}</span>
										<DeleteButton
											onClick={() => removeReader(notebookIndex, readerIndex)}
											label={`Excluir leitor ${reader.number}`}
										/>
									</div>
								))}
							</div>
						</div>
					))}

					{pdvs.map((device, idx) => (
						<div key={`${device.numero_impressora}-${idx}`} className="mb-3 flex items-center justify-between form-card px-4 py-3">
							<p className="font-bold text-[14px]">
								Maquininha PDV {device.numero_impressora}{device.operador ? ` - ${device.operador}` : ''}
							</p>
							<DeleteButton
								onClick={() => setPdvs(prev => prev.filter((_, index) => index !== idx))}
								label="Excluir maquininha"
							/>
						</div>
					))}
				</div>

				<div className="flex justify-center">
					<button type="submit" className="btn btn--filled-mid-green" disabled={loading}>CRIAR EVENTO</button>
				</div>
			</form>
		</div>
	);
};

export default CreateEvent;
