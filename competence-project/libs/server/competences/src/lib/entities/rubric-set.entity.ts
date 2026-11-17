import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RubricLevel } from './rubric-level.entity';
import { Indicator } from './indicator.entity';

@Entity('rubric_set')
export class RubricSet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'boolean', nullable: false, default: false })
    yes_no: boolean;

    @OneToMany(() => Indicator, (indicator) => indicator.rubric_set)
    indicators: Indicator[];

    @OneToMany(() => RubricLevel, (rubric_level) => rubric_level.rubric_set)
    rubric_levels: RubricLevel[];
}