import type { NextPage } from 'next'
import { useMutation, useQuery } from 'react-query'
import { GameFormValues } from '../../components/pages/games/GameForm'
import GamesView from '../../components/pages/games/GamesView'
import createGame from '../../lib/api/games/client/createGame'
import deleteGames from '../../lib/api/games/client/deleteGames'
import { getGames } from '../../lib/api/games/client/getGames'

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

    const handleDeleteGame = (gameId: string) => {
        deleteGamesMutation([gameId])
    }

    return (
        <GamesView
            games={games}
            handleCreateGame={createGameMutation}
            handleDeleteGame={handleDeleteGame}
        />
    )
}

export default Games
