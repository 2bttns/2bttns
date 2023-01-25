import axios from 'axios'
import { ListItemCreationAttributes } from '../../../../db/models/ListItemModel'
import { API_URL, DefaultResponse } from '../../constants'

export type UpdateListItemsParams = {
    list_id: string
    list_item_ids: string[]
    body: Partial<ListItemCreationAttributes>
}

export async function updateListItems(params: UpdateListItemsParams) {
    let url = `${API_URL}/lists/${
        params.list_id
    }/list-items?list_item_ids=${params.list_item_ids.join(',')}`

    return await axios.put(url, params.body).then((res) => {
        return res.data as DefaultResponse
    })
}
