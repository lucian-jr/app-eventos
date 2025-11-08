import { useEffect, useState } from 'react';

import CurrencyInput from 'react-currency-input-field';

import { formataValor } from '../../utils/value.util';
import { Delete } from "@mui/icons-material";

// Types
import type { DevicesType, ProductsType, PostEventType } from '../../services/events/events.types';

// API
import { postEvent } from '../../services/events/events.service';

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [eventName, setEventName] = useState("");
	const [eventDate, setEventDate] = useState("");
	const [productName, setProductName] = useState("");
	const [productValue, setProductValue] = useState("");
	const [products, setProducts] = useState<ProductsType[]>([]);
	const [device, setDevice] = useState("");
	const [numeroImpressora, setNumeroImpressora] = useState("");
	const [devices, setDevices] = useState<DevicesType[]>([]);
	const [error, setError] = useState("");

	const addProduct = async () => {

		if (!productName || !productValue) {
			setError("Preencha os campos do produto corretamente!");
			return;
		}

		const alreadyInsertedBefore = products.some((e) => e.name.toLocaleLowerCase() === productName.toLocaleLowerCase());

		if (alreadyInsertedBefore) {
			setError("Este produto já foi inserido anteriormente.")
			return;
		}

		const dataProduct: ProductsType = {
			name: productName,
			value: formataValor(productValue),
			quantity: null
		}


		setProducts(prev => [...prev, dataProduct])
		setProductName("");
		setProductValue("");
		setError("");
	};

	const removeProduct = async (pName: string) => {

		const confirmDelete = window.confirm(
			`Tem certeza que deseja excluir o produto "${pName}"?`
		);

		if (!confirmDelete) return;

		setProducts(prev => prev.filter(e => e.name.toLocaleLowerCase() !== pName.toLocaleLowerCase()));
	};

	const countDevices = (name: string) => {
		const devicesNumber = devices.filter((d) => d.name.toLocaleLowerCase() === name.toLocaleLowerCase()).length + 1;
		return devicesNumber;
	};

	const addDevice = async () => {

		if (!device) {
			setError("Selecione um Ponto de devolução!");
			return;
		}

		const howManyAlready = countDevices(device);

		const newDevice: DevicesType = {
			name: device,
			number: '01',
			numero_impressora: numeroImpressora
		}

		if (howManyAlready) {
			newDevice.number = howManyAlready < 10 ? '0' + howManyAlready : String(howManyAlready);
		}


		setDevices(prev => [...prev, newDevice])
		setDevice("");
		setError("");
	};

	const removeDevice = async (dName: string, dNumber: string) => {

		const confirmDelete = window.confirm(
			"Tem certeza que deseja excluir o ponto de devolução?"
		);

		if (!confirmDelete) return;

		setDevices(prev => prev.filter(e => e.name !== dName || e.number !== dNumber));
	};

	const createEvent = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!(devices.length > 0 && products.length > 0 && eventName && eventDate)) return;

		const eventData: PostEventType = {
			user_id: user?.id,
			nome: eventName,
			data_evento: eventDate,
			devices: devices,
			products: products
		}

		const res = await postEvent(eventData);

		if (res.status != 'success') {
			setError(res.message)
			return;
		}

		alert('Evento criado com sucesso!');
		navigate('/', { replace: true });
	}

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

	useEffect(() => {
		if(device === 'Maquininha PDV') {
			console.log('Maquininha')
		}
	}, [device])

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="font-bold text-[20px]">CRIAR EVENTO</h1>
			</div>

			{error && <p className="msg error-msg mb-4">{error}</p>}

			<form onSubmit={createEvent}>
				<div className="flex gap-5 mb-8">
					<input
						className="px-7 h-9 w-[100%]"
						type="text"
						name="nome"
						placeholder="Nome do evento"
						value={eventName}
						onChange={(e) => setEventName(e.target.value)}
						required
					/>

					<input
						className="h-9"
						type="date"
						name="data_evento"
						placeholder="Data do evento"
						value={eventDate}
						onChange={(e) => setEventDate(e.target.value)}
						required
					/>
				</div>

				<h2 className="font-bold text-[20px] mb-4">Adicionar ponto de devolução</h2>

				<div className="flex gap-6 mb-8">
					<select
						name="adiciona_produto"
						className="px-7 h-9 w-[100%]"
						onChange={(e) => setDevice(e.target.value)}
						value={device}
					>
						<option value="" disabled>Selecione o material (leitor + impressora ou maquininha pdv)</option>
						<option value="Leitor + impressora">Leitor + impressora</option>
						<option value="Maquininha PDV">Maquininha PDV</option>
					</select>

					{ device === 'Maquininha PDV' && 
						<input
							className="h-9"
							type="text"
							name="numero_impressora"
							placeholder="Ex: 000303"
							value={numeroImpressora ?? ""}
							onChange={(e) => setNumeroImpressora(e.target.value)}
							required
						/>
					}

					<button type="button" className="btn btn--filled-mid-green" onClick={addDevice}>ADICIONAR</button>
				</div>

				<div className="mb-8">
					{devices.length > 0
						? (
							devices.map((device, idx) => (
								<p key={idx} className="font-bold text-[14px]">
									{device.name} {device.number}
									<button
										type='button'
										className="ml-2.5 text-red-700"
										onClick={() => removeDevice(device.name, device.number)}
									><Delete /></button>
								</p>
							))
						)
						:
						(<p className="font-bold text-[14px]"></p>)
					}
				</div>

				<h2 className="font-bold text-[20px] mb-4">Adicionar produto(s)</h2>

				<div className="flex gap-6 mb-4">
					<input
						className="px-7 h-9 w-[50%]"
						type="text"
						name="nome_produto"
						placeholder="Nome do produto"
						value={productName}
						onChange={(e) => setProductName(e.target.value)}
					/>

					<CurrencyInput
						name="valor_produto"
						placeholder="Valor R$0,00"
						decimalsLimit={2}
						intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
						className="px-7 h-9 w-[50%] border rounded"
						value={productValue}
						onValueChange={(val) => setProductValue(val || "")}
					/>

					<button type='button' className="btn btn--filled-mid-green" onClick={addProduct}>ADICIONAR</button>
				</div>

				<div className="mb-8">
					{products.length > 0
						? (
							products.map((product, idx) => (
								<p key={idx} className="font-bold text-[14px]">
									{product.name} R${product.value}
									<button
										type='button'
										className="ml-2.5 text-red-700"
										onClick={() => removeProduct(product.name)}
									><Delete /></button>
								</p>
							))
						)
						:
						(<p className="font-bold text-[14px]"></p>)
					}
				</div>

				{products.length > 0 && <h2 className="font-bold text-[20px] mb-4">Número de vouchers necessários para esse evento</h2>}

				<div className="mb-10">
					{products.length > 0
						? (
							products.map((product, idx) => (
								<div key={idx} className="flex justify-between items-center mb-6">
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
							))
						)
						:
						(<p className="font-bold text-[14px]"></p>)
					}
				</div>

				<div className="flex justify-center">
					<button type="submit" className="btn btn--filled-mid-green">CRIAR EVENTO</button>
				</div>
			</form>
		</div>
	)
}

export default CreateEvent