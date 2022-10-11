import { Optional, UUIDV4 } from 'sequelize'
import {
    Column,
    Default,
    HasOne,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript'
import ListModel from './ListModel'

export interface GameAttributes {
    id: string
    name?: string
    description?: string
    input_list_id?: string
    output_list_id?: string
}

export interface GameCreationAttributes
    extends Optional<
        GameAttributes,
        'id' | 'name' | 'description' | 'input_list_id' | 'output_list_id'
    > {}

@Table({ tableName: 'games', timestamps: false })
class GameModel extends Model<GameAttributes, GameCreationAttributes> {
    @Default(UUIDV4)
    @PrimaryKey
    @Column
    id: string

    @Column
    name: string

    @Column
    description: string

    @HasOne(() => ListModel, { onDelete: 'SET NULL' })
    input_list_id: ListModel

    @HasOne(() => ListModel, { onDelete: 'SET NULL' })
    output_list_id: ListModel
}

export default GameModel
