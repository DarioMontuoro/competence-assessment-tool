import { Entity, Column, PrimaryGeneratedColumn, Check, OneToMany } from 'typeorm';
import { Subcompetency } from './subcompetency.entity';

@Entity('competency')
@Check(`"weight" >= 1 AND "weight" <= 5`)
export class Competency {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    title: string;

    @Column({ type: 'int', nullable: false })
    weight: number;

    @OneToMany(() => Subcompetency, (subcompetency) => subcompetency.competency)
    subcompetencies: Subcompetency[];
}