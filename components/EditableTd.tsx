import { ChakraProps, Td, UseEditableProps } from '@chakra-ui/react'
import CustomEditable from './CustomEditable'

export type EditableTdProps = {
    value?: string
    handleSave?: UseEditableProps['onSubmit']
    isTextarea?: boolean
    isEditable?: boolean
    sx?: ChakraProps['sx']
}

export default function EditableTd(props: EditableTdProps) {
    const { value, sx, handleSave, isTextarea, isEditable = true } = props

    return (
        <Td
            sx={{
                verticalAlign: 'top',
                ...sx,
            }}
        >
            <CustomEditable
                value={value}
                handleSave={handleSave}
                isTextarea={isTextarea}
                isEditable={isEditable}
            />
        </Td>
    )
}
