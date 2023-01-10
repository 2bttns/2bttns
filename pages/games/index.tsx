import type { NextPage } from 'next'
import { useMutation, useQuery } from 'react-query'
import { GameFormValues } from '../../components/pages/games/GameForm'
import GamesView, {
    GamesViewProps,
} from '../../components/pages/games/GamesView'
import createGame from '../../lib/api/games/client/createGame'
import deleteGames from '../../lib/api/games/client/deleteGames'
import { getGames } from '../../lib/api/games/client/getGames'
import updateGames from '../../lib/api/games/client/updateGames'

const Games: NextPage = () => {
    const gamesQuery = useQuery('games', () => {
        return getGames()
    })
    const games = gamesQuery?.data?.games

    const { mutate: createGameMutation } = useMutation(
        (values: GameFormValues) => {
            return createGame(values)
        },
        {
            onSuccess: (data) => {
                gamesQuery.refetch()
            },
        }
    )

    const { mutate: deleteGamesMutation } = useMutation(
        (gameIds: string[]) => {
            return deleteGames(gameIds)
        },
        {
            onSuccess: (data) => {
                gamesQuery.refetch()
            },
        }
    )

    const handleDeleteGame: GamesViewProps['handleDeleteGame'] = (gameId) => {
        deleteGamesMutation([gameId])
    }

    const { mutate: editGamesMutation } = useMutation(
        (params: {
            gameIds: Parameters<typeof updateGames>[0]
            body: Parameters<typeof updateGames>[1]
        }) => {
            return updateGames(params['gameIds'], params['body'])
        },
        {
            onSuccess: (data) => {
                gamesQuery.refetch()
            },
        }
    )
    const handleFieldEdited: GamesViewProps['handleFieldEdited'] = (
        field,
        newValue,
        game
    ) => {
        const { id, ...gameDataExcludingGameId } = game
        const updated: Parameters<typeof updateGames>[1] = {
            ...gameDataExcludingGameId,
            [field]: newValue,
        }

        editGamesMutation({
            gameIds: [id],
            body: updated,
        })
    }

    return (
        <GamesView
            games={games}
            handleCreateGame={createGameMutation}
            handleDeleteGame={handleDeleteGame}
            handleFieldEdited={handleFieldEdited}
        />
    )
}

export default Games
