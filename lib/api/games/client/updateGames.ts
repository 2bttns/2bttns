import axios from 'axios'
import { GameCreationAttributes } from '../../../../db/models/GameModel'
import { API_URL } from '../../constants'

export default async function updateGames(
    game_ids: string[],
    body: Omit<GameCreationAttributes, 'id'>
) {
    return await axios.put(
        `${API_URL}/games?game_ids=${game_ids.join(',')}`,
        body
    )
}
