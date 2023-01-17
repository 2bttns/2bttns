import axios from 'axios'
import { API_URL } from '../../constants'
import { DefaultResponse } from './../../constants'

export type DeleteListsParams = {
    list_id: string
}

export async function deleteList(params: DeleteListsParams) {
    let url = `${API_URL}/lists/${params.list_id}`

    return await axios.delete(url).then((res) => {
        return res.data as DefaultResponse
    })
}
