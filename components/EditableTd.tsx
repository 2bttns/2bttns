import { ChakraProps, Td, UseEditableProps } from '@chakra-ui/react'
import CustomEditable, { CustomEditableProps } from './CustomEditable'

export type EditableTdProps = CustomEditableProps & {
    sx?: ChakraProps['sx']
}

export default function EditableTd(props: EditableTdProps) {
    const {
        value,
        placeholder,
        handleSave,
        isTextarea,
        isEditable = true,
        sx,
    } = props

    return (
        <Td
            sx={{
                verticalAlign: 'top',
                ...sx,
            }}
        >
            <CustomEditable
                value={value}
                placeholder={placeholder}
                handleSave={handleSave}
                isTextarea={isTextarea}
                isEditable={isEditable}
            />
        </Td>
    )
}
