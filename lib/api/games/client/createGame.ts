import axios from 'axios'
import { API_URL } from '../../constants'
import { GameCreationAttributes } from '../../../../db/models/GameModel'

export default async function createGame(body: GameCreationAttributes) {
    return await axios.post(`${API_URL}/games`, body)
}
