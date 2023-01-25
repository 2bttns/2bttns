import axios from 'axios'
import { ListItemCreationAttributes } from '../../../../db/models/ListItemModel'
import { API_URL, DefaultResponse } from '../../constants'

export type UpdateListItemParams = {
    list_id: string
    body: Partial<ListItemCreationAttributes>
}

export async function updateList(params: UpdateListItemParams) {
    let url = `${API_URL}/lists/${params.list_id}/list-items`

    return await axios.put(url, params.body).then((res) => {
        return res.data as DefaultResponse
    })
}
