import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Subcompetency } from './subcompetency.entity';
import { Indicator } from './indicator.entity';

@Entity('observation_object')
export class ObservationObject {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: false })
    description: string;

    @OneToOne(() => Subcompetency, (subcompetency) => subcompetency.observation_object, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'subcompetency_id' })
    subcompetency: Subcompetency;

    @OneToMany(() => Indicator, (indicator) => indicator.observation_object)
    indicators: Indicator[];
}