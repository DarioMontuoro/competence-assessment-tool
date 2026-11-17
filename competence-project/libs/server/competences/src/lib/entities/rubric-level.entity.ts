import { Entity, Column, PrimaryGeneratedColumn, Check, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { RubricSet } from './rubric-set.entity';

@Entity('rubric_level')
@Check(`"rank" >= 1 AND "rank" <= 5`)
@Unique(['rank', 'rubric_set'])
export class RubricLevel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    rank: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description: string | null;

    @ManyToOne(() => RubricSet, (rubric_set) => rubric_set.rubric_levels, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'rubric_set_id' })
    rubric_set: RubricSet;
}