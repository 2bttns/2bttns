import axios from 'axios'
import { API_URL } from '../../constants'

export default async function deleteGames(game_ids: string[]) {
    return await axios.delete(`${API_URL}/games?game_ids=${game_ids.join(',')}`)
}
