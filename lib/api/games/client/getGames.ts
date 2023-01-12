import axios from 'axios'
import { API_URL } from '../../constants'
import { GetGamesRouteResponse } from '../server/getGamesRoute'

export async function getGames() {
    return await axios.get(`${API_URL}/games`).then((res) => {
        return res.data as GetGamesRouteResponse
    })
}
