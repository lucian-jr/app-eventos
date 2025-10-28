import { useState } from 'react';
import CurrencyInput from 'react-currency-input-field';

type ProductsType = {
	name: string
	value: string
	quantidade: number | null
}

type DevolutionDevicesType = {
	name: string
	number: string
}

const CreateEvent = () => {
	const [products, setProducts] = useState<Array<ProductsType>>([]);
	const [devolutionDevices, setDevolutionDevices] = useState<Array<DevolutionDevicesType>>([])

	const addProduct = async () => {
		
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="font-bold text-[20px]">CRIAR EVENTO</h1>
			</div>

			<form>
				<div className="flex gap-5 mb-8">
					<input
						className="px-7 h-9 w-[100%]"
						type="text"
						name="nome"
						placeholder="Nome do evento"
					/>

					<input
						className="h-9"
						type="date"
						name="data_evento"
						placeholder="Data do evento"
					/>
				</div>

				<h2 className="font-bold text-[20px] mb-4">Adicionar produto(s)</h2>

				<div className="flex gap-6 mb-8">
					<input
						className="px-7 h-9 w-[50%]"
						type="text"
						name="nome_produto"
						placeholder="Nome do produto"
					/>

					<CurrencyInput
						name="valor_produto"
						placeholder="Valor R$0,00"
						decimalsLimit={2}
						intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
						className="px-7 h-9 w-[50%] border rounded"
					/>

					<button className="btn btn--filled-mid-green">ADICIONAR</button>
				</div>

				<h2 className="font-bold text-[20px] mb-4">Adicionar ponto de devolução</h2>

				<div className="flex gap-6 mb-8">
					<select name="adiciona_produto" className="px-7 h-9 w-[100%]">
						<option value="" disabled selected>Selecione o material (leitor + impressora ou maquininha pdv)</option>
					</select>

					<button className="btn btn--filled-mid-green">ADICIONAR</button>
				</div>

				<h2 className="font-bold text-[20px] mb-4">Numero de vouchers necessários para esse evento</h2>

				<div className="mb-8">
					<div className="flex justify-between items-center mb-6">
						<strong>Copo Eco R$10,00</strong>
						<input
							className="px-7 h-9"
							type="text"
							name="produto_quantidade"
							placeholder="Quantidade"
						/>
					</div>

					<div className="flex justify-between items-center">
						<strong>Cartão Zig R$ 10,00</strong>
						<input
							className="px-7 h-9"
							type="text"
							name="produto_quantidade"
							placeholder="Quantidade"
						/>
					</div>
				</div>
			</form>
		</div>
	)
}

export default CreateEvent