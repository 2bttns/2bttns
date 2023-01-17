import axios from 'axios'
import { API_URL } from '../../constants'
import { DefaultResponse } from './../../constants'

export type DeleteListParams = {
    list_id: string
}

export async function deleteList(params: DeleteListParams) {
    let url = `${API_URL}/lists/${params.list_id}`

    return await axios.delete(url).then((res) => {
        return res.data as DefaultResponse
    })
}
