import axios from 'axios'
import { API_URL, DefaultResponse } from '../../constants'

export type DeleteListItemsParams = {
    list_id: string
    list_item_ids: string[]
}

export async function deleteListItems(params: DeleteListItemsParams) {
    let url = `${API_URL}/lists/${
        params.list_id
    }/list-items?delete=${params.list_item_ids.join(',')}`

    return await axios.delete(url).then((res) => {
        return res.data as DefaultResponse
    })
}
