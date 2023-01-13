import axios from 'axios'
import { API_URL } from '../../constants'
import { GetGamesRouteResponse } from '../server/getGamesRoute'

export async function getGames(game_ids: string[] = []) {
    let url = `${API_URL}/games`

    if (game_ids.length > 0) {
        url += `?game_ids=${game_ids.join(',')}`
    }

    return await axios.get(url).then((res) => {
        return res.data as GetGamesRouteResponse
    })
}
