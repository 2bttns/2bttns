import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons'
import {
    ButtonGroup,
    ChakraProps,
    Editable,
    EditableInput,
    EditablePreview,
    EditableTextarea,
    Flex,
    IconButton,
    Stack,
    Td,
    useEditableControls,
    UseEditableProps,
} from '@chakra-ui/react'

export type EditableTdProps = {
    value?: string
    handleSave?: UseEditableProps['onSubmit']
    isTextarea?: boolean
    isEditable?: boolean
    sx?: ChakraProps['sx']
}

export default function EditableTd(props: EditableTdProps) {
    const { value, sx, handleSave, isTextarea, isEditable = true } = props

    function EditableControls() {
        const {
            isEditing,
            getSubmitButtonProps,
            getCancelButtonProps,
            getEditButtonProps,
        } = useEditableControls()

        return isEditing ? (
            <ButtonGroup size="sm">
                <IconButton
                    icon={<CheckIcon />}
                    aria-label="Save"
                    {...getSubmitButtonProps()}
                />
                <IconButton
                    icon={<CloseIcon />}
                    aria-label="Cancel"
                    {...getCancelButtonProps()}
                />
            </ButtonGroup>
        ) : (
            <Flex>
                <IconButton
                    size="sm"
                    icon={<EditIcon />}
                    aria-label="Edit"
                    {...getEditButtonProps()}
                />
            </Flex>
        )
    }

    return (
        <Td
            sx={{
                verticalAlign: 'top',
                ...sx,
            }}
        >
            {!isEditable && value}
            {isEditable && (
                <Editable
                    defaultValue={value || ''}
                    isPreviewFocusable={false}
                    onSubmit={handleSave}
                >
                    <Stack direction="row">
                        <EditablePreview as="pre" />
                        {isTextarea ? <EditableTextarea /> : <EditableInput />}
                        <EditableControls />
                    </Stack>
                </Editable>
            )}
        </Td>
    )
}
