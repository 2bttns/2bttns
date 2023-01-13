import axios from 'axios'
import { API_URL } from '../../constants'
import { GetListsRouteResponse } from '../server/getListsRoute'

export type GetListsParams = {
    list_ids?: string[]
    include_list_items?: boolean
    include_games?: boolean
}

export async function getLists(params?: GetListsParams) {
    const list_ids = params?.list_ids ?? []
    const include_list_items = params?.include_list_items ?? false
    const include_games = params?.include_games ?? false

    let url = `${API_URL}/lists`

    const searchParams = new URLSearchParams()
    if (list_ids.length > 0) {
        searchParams.append('list_ids', list_ids.join(','))
    }
    if (include_list_items) {
        searchParams.append('include_list_items', 'true')
    }
    if (include_games) {
        searchParams.append('include_games', 'true')
    }
    if (searchParams.toString().length > 0) {
        url += `?${searchParams.toString()}`
    }

    return await axios.get(url).then((res) => {
        return res.data as GetListsRouteResponse
    })
}
