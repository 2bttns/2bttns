import { Table, Tbody, Td, Thead, Tr } from '@chakra-ui/react'
import { GameAttributes } from '../../../db/models/GameModel'
import EditableTd from '../../EditableTd'

export type GamesTableProps = {
    games: GameAttributes[]
    renderActions?: (game: GameAttributes) => React.ReactNode
    isEditable?: boolean
    onFieldEdited?: (
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
                                if (!onFieldEdited) {
                                    return
                                }
                                onFieldEdited('name', value, game)
                            }}
                            isEditable={isEditable}
                        />
                        <EditableTd
                            value={game.description}
                            isTextarea
                            handleSave={(value) => {
                                if (!onFieldEdited) {
                                    return
                                }
                                onFieldEdited('description', value, game)
                            }}
                            isEditable={isEditable}
                        />
                        <EditableTd
                            value={game.plugins}
                            handleSave={(value) => {
                                if (!onFieldEdited) {
                                    return
                                }
                                onFieldEdited('plugins', value, game)
                            }}
                            isEditable={isEditable}
                        />
                        {renderActions && (
                            <Td sx={{ verticalAlign: 'top' }}>
                                {renderActions(game)}
                            </Td>
                        )}
                    </Tr>
                ))}
            </Tbody>
        </Table>
    )
}
