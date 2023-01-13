import axios from 'axios'
import { API_URL } from '../../constants'
import { GetListsRouteResponse } from '../server/getListsRoute'

export async function getLists(list_ids: string[] = []) {
    let url = `${API_URL}/lists`

    if (list_ids.length > 0) {
        url += `?list_ids=${list_ids.join(',')}`
    }

    return await axios.get(url).then((res) => {
        return res.data as GetListsRouteResponse
    })
}
