import { Delete } from '@mui/icons-material'

type DeleteButtonProps = {
	onClick: () => void
	label: string
}

export function DeleteButton({ onClick, label }: DeleteButtonProps) {
	return (
		<button type="button" className="delete-btn" onClick={onClick} aria-label={label}>
			<Delete fontSize="small" />
		</button>
	)
}
