import axios from 'axios'
import { ListCreationAttributes } from '../../../../db/models/ListModel'
import { API_URL } from '../../constants'
import { DefaultResponse } from './../../constants'

export type AddListItemParams = {
    listId: string
    listItems: ListCreationAttributes[]
}

export async function addListItems({ listId, listItems }: AddListItemParams) {
    let url = `${API_URL}/lists/${listId}/list-items`

    return await axios.post(url, listItems).then((res) => {
        return res.data as DefaultResponse
    })
}
