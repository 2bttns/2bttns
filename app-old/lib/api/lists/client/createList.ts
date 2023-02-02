import axios from 'axios'
import { ListCreationAttributes } from '../../../../db/models/ListModel'
import { API_URL } from '../../constants'
import { CreateListResponse } from './../server/createListRoute'

export type CreateListParams = {
    body: ListCreationAttributes
}

export async function createList(params: CreateListParams) {
    let url = `${API_URL}/lists`

    return await axios.post(url, params.body).then((res) => {
        return res.data as CreateListResponse
    })
}
