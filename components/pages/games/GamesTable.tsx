import { Button, Table, Tbody, Td, Thead, Tr } from '@chakra-ui/react'
import Link from 'next/link'
import { GameAttributes } from '../../../db/models/GameModel'

export type GamesTableProps = {
    games: GameAttributes[]
    renderActions?: (game: GameAttributes) => React.ReactNode
}

export default function GamesTable({ games, renderActions }: GamesTableProps) {
    return (
        <Table>
            <Thead>
                <Tr>
                    <Td fontWeight="bold">Name</Td>
                    <Td fontWeight="bold">Description</Td>
                    <Td fontWeight="bold">Plugins</Td>
                    {renderActions && <Td fontWeight="bold">Actions</Td>}
                </Tr>
            </Thead>
            <Tbody>
                {games.map((game) => (
                    <Tr key={game.id}>
                        <Td>{game.name}</Td>
                        <Td>{game.description}</Td>
                        <Td>{game.plugins}</Td>
                        {renderActions && <Td>{renderActions(game)}</Td>}
                    </Tr>
                ))}
            </Tbody>
        </Table>
    )
}
