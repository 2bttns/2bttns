import { Optional, UUIDV4 } from 'sequelize'
import {
    Column,
    Default,
    HasMany,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript'
import ListItemModel, {
    ListItemRelationshipCreationAttributes,
} from './ListItemModel'

export interface ListAttributes {
    id: string
    name: string
    description?: string
    list_items?: ListItemRelationshipCreationAttributes[]
}

export interface ListCreationAttributes
    extends Optional<ListAttributes, 'id' | 'description' | 'list_items'> {}

@Table({ tableName: 'lists', timestamps: false })
class ListModel extends Model<ListAttributes, ListCreationAttributes> {
    @Default(UUIDV4)
    @PrimaryKey
    @Column
    id: string

    @Column
    name: string

    @Column
    description: string

    @HasMany(() => ListItemModel)
    list_items: ListItemModel[]
}

export default ListModel
