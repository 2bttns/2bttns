import axios from 'axios'
import { ListCreationAttributes } from '../../../../db/models/ListModel'
import { API_URL, DefaultResponse } from '../../constants'

export type UpdateListParams = {
    list_id: string
    body: Partial<ListCreationAttributes>
}

export async function updateList(params: UpdateListParams) {
    let url = `${API_URL}/lists/${params.list_id}`

    return await axios.put(url, params.body).then((res) => {
        return res.data as DefaultResponse
    })
}
