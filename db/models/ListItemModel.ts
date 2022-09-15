import { Optional, UUIDV4 } from 'sequelize'
import {
    BelongsTo,
    Column,
    Default,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript'
import ListModel from './ListModel'

export interface ListItemAttributes {
    id: string
    name: string
    description?: string
    list_id: string
}

export interface ListItemCreationAttributes
    extends Optional<ListItemAttributes, 'id' | 'description'> {}

// Creating a ListItem through a relationship will automatically pass the list's id to list_id
// -- 'list_id' should not be passed manually in such cases.
export type ListItemRelationshipCreationAttributes = Omit<
    ListItemCreationAttributes,
    'list_id'
>

@Table({ tableName: 'list_items', timestamps: false })
class ListItemModel extends Model<
    ListItemAttributes,
    ListItemCreationAttributes
> {
    @Default(UUIDV4)
    @PrimaryKey
    @Column
    id: string

    @Column
    name: string

    @Column
    description: string

    @ForeignKey(() => ListModel)
    @Column
    list_id: string

    @BelongsTo(() => ListModel)
    list: ListModel[]
}

export default ListItemModel
