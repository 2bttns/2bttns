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
    Table,
    Tbody,
    Td,
    Thead,
    Tr,
    useEditableControls,
    UseEditableProps,
} from '@chakra-ui/react'
import { GameAttributes } from '../../../db/models/GameModel'

export type GamesTableProps = {
    games: GameAttributes[]
    renderActions?: (game: GameAttributes) => React.ReactNode
    isEditable?: boolean
    onFieldEdited: (
        field: keyof GameAttributes,
        newValue: unknown,
        game: GameAttributes
    ) => void
}

export default function GamesTable(props: GamesTableProps) {
    const { games, renderActions, isEditable = true, onFieldEdited } = props

    return (
        <Table>
            <Thead>
                <Tr>
                    <Td fontWeight="bold" width="1/4">
                        Name
                    </Td>
                    <Td fontWeight="bold" width="1/4">
                        Description
                    </Td>
                    <Td fontWeight="bold" width="1/4">
                        Plugins
                    </Td>
                    {renderActions && (
                        <Td fontWeight="bold" width="1/4">
                            Actions
                        </Td>
                    )}
                </Tr>
            </Thead>
            <Tbody>
                {games.map((game) => (
                    <Tr key={game.id}>
                        <EditableTd
                            value={game.name}
                            handleSave={(value) => {
                                onFieldEdited('name', value, game)
                            }}
                            isEditable={isEditable}
                        />
                        <EditableTd
                            value={game.description}
                            isTextarea
                            handleSave={(value) => {
                                onFieldEdited('description', value, game)
                            }}
                            isEditable={isEditable}
                        />
                        <EditableTd
                            value={game.plugins}
                            handleSave={(value) => {
                                onFieldEdited('plugins', value, game)
                            }}
                            isEditable={isEditable}
                        />
                        {renderActions && <Td>{renderActions(game)}</Td>}
                    </Tr>
                ))}
            </Tbody>
        </Table>
    )
}

export type EditableTdProps = {
    value?: string
    handleSave?: UseEditableProps['onSubmit']
    isTextarea?: boolean
    isEditable?: boolean
    sx?: ChakraProps['sx']
}

function EditableTd(props: EditableTdProps) {
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
                        <EditablePreview />
                        {isTextarea ? <EditableTextarea /> : <EditableInput />}
                        <EditableControls />
                    </Stack>
                </Editable>
            )}
        </Td>
    )
}
