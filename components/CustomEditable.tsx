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
import { useEffect, useState } from 'react'

export type CustomEditableProps = {
    value?: string
    placeholder?: string
    handleSave?: UseEditableProps['onSubmit']
    isTextarea?: boolean
    isEditable?: boolean
}

export default function CustomEditable(props: CustomEditableProps) {
    const {
        value,
        placeholder = '',
        handleSave,
        isTextarea,
        isEditable = true,
    } = props

    const [liveValue, setLiveValue] = useState(value)
    useEffect(() => {
        setLiveValue(value)
    }, [value])

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
            {!isEditable && (value || placeholder)}
            {isEditable && (
                <Editable
                    defaultValue={value}
                    value={liveValue}
                    placeholder={placeholder}
                    isPreviewFocusable={false}
                    onSubmit={handleSave}
                    onChange={(updated) => {
                        setLiveValue(updated)
                    }}
                >
                    <Stack direction="row">
                        <EditablePreview
                            as="span"
                            sx={{
                                whiteSpace: 'pre-wrap',
                            }}
                        />
                        {isTextarea ? <EditableTextarea /> : <EditableInput />}
                        <EditableControls />
                    </Stack>
                </Editable>
            )}
        </>
    )
}
