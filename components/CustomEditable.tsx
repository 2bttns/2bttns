import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons'
import {
    ButtonGroup,
    Editable,
    EditableInput,
    EditablePreview,
    EditableTextarea,
    Flex,
    IconButton,
    Stack,
    useEditableControls,
    UseEditableProps,
} from '@chakra-ui/react'

export type CustomEditableProps = {
    value?: string
    handleSave?: UseEditableProps['onSubmit']
    isTextarea?: boolean
    isEditable?: boolean
}

export default function CustomEditable(props: CustomEditableProps) {
    const { value, handleSave, isTextarea, isEditable = true } = props

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
        <>
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
        </>
    )
}
