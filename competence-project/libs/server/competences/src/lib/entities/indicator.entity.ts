import { Entity, Column, PrimaryGeneratedColumn, Check, ManyToOne, JoinColumn } from 'typeorm';
import { ObservationObject } from './observation-object.entity';
import { RubricSet } from './rubric-set.entity';

@Entity('indicator')
@Check(`"weight" >= 1 AND "weight" <= 5`)
export class Indicator {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: false })
    description: string;

    @Column({ type: 'int', nullable: false })
    weight: number;

    @ManyToOne(() => ObservationObject, (observation_object) => observation_object.indicators, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'observation_object_id' })
    observation_object: ObservationObject;

    @ManyToOne(() => RubricSet, (rubric_set) => rubric_set.indicators, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'rubric_set_id' })
    rubric_set: RubricSet;
}