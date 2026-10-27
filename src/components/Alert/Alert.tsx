import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type Variant = 'success' | 'error' | 'confirm'

type AlertInput = {
	title?: string
	message: string
	variant?: Variant
	confirmLabel?: string
	cancelLabel?: string
	tone?: 'default' | 'danger'
}

type AlertItem = {
	title: string
	message: string
	variant: Variant
	confirmLabel: string
	cancelLabel: string
	tone: 'default' | 'danger'
	resolve: (value: boolean) => void
}

const AlertContext = createContext<{
	notify: (input: AlertInput) => Promise<void>
	confirm: (input: AlertInput) => Promise<boolean>
} | null>(null)

export function AlertProvider({ children }: { children: ReactNode }) {
	const queue = useRef<AlertItem[]>([])
	const [current, setCurrent] = useState<AlertItem | null>(null)

	const enqueue = useCallback((item: Omit<AlertItem, 'resolve'>) => {
		return new Promise<boolean>((resolve) => {
			const entry: AlertItem = { ...item, resolve }
			setCurrent((prev) => {
				if (prev) {
					queue.current.push(entry)
					return prev
				}
				return entry
			})
		})
	}, [])

	const close = useCallback((accepted: boolean) => {
		setCurrent((prev) => {
			prev?.resolve(accepted)
			return queue.current.shift() ?? null
		})
	}, [])

	useEffect(() => {
		if (!current) return

		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				close(current.variant === 'confirm' ? false : true)
			}
		}

		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [current, close])

	const notify = useCallback((input: AlertInput) => {
		const variant = input.variant === 'error' ? 'error' : 'success'
		return enqueue({
			title: input.title ?? (variant === 'error' ? 'Algo deu errado' : 'Pronto'),
			message: input.message,
			variant,
			confirmLabel: input.confirmLabel ?? 'OK',
			cancelLabel: '',
			tone: 'default',
		}).then(() => undefined)
	}, [enqueue])

	const confirm = useCallback((input: AlertInput) => {
		return enqueue({
			title: input.title ?? 'Confirmar',
			message: input.message,
			variant: 'confirm',
			confirmLabel: input.confirmLabel ?? 'Confirmar',
			cancelLabel: input.cancelLabel ?? 'Cancelar',
			tone: input.tone ?? 'default',
		})
	}, [enqueue])

	const confirmClass = current?.tone === 'danger' ? 'btn btn--danger' : 'btn btn--filled-mid-green'

	return (
		<AlertContext.Provider value={{ notify, confirm }}>
			{children}
			{current && (
				<div
					className="app-alert"
					role="presentation"
					onClick={() => close(current.variant !== 'confirm')}
				>
					<div
						className="app-alert__card"
						role="dialog"
						aria-modal="true"
						aria-labelledby="app-alert-title"
						onClick={(event) => event.stopPropagation()}
					>
						<h2 id="app-alert-title" className="app-alert__title">{current.title}</h2>
						<p className="app-alert__message">{current.message}</p>
						<div className="app-alert__actions">
							{current.variant === 'confirm' && (
								<button type="button" className="btn btn--outlined" onClick={() => close(false)}>
									{current.cancelLabel}
								</button>
							)}
							<button type="button" className={confirmClass} onClick={() => close(true)} autoFocus>
								{current.confirmLabel}
							</button>
						</div>
					</div>
				</div>
			)}
		</AlertContext.Provider>
	)
}

export function useAppAlert() {
	const context = useContext(AlertContext)
	if (!context) {
		throw new Error('useAppAlert precisa estar dentro de AlertProvider')
	}
	return context
}
