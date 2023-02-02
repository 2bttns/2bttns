import { ListModel } from '../../../../db'
import { DefaultResponse } from './../../constants'
export interface CreateListResponse extends DefaultResponse {
    result: ListModel
}
