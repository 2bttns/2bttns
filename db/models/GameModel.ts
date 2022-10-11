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
import { gameInclude } from '../constants'
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

    @ForeignKey(() => ListModel)
    @Default(null)
    @Column
    input_list_id: string

    @BelongsTo(() => ListModel, {
        as: gameInclude.input_list,
    })
    input_list: ListModel

    @ForeignKey(() => ListModel)
    @Default(null)
    @Column
    output_list_id: string

    @BelongsTo(() => ListModel, {
        as: gameInclude.output_list,
    })
    output_list: ListModel
}

export default GameModel
