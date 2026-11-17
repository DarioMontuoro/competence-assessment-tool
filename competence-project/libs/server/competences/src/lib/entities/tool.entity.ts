import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Subcompetency } from './subcompetency.entity';

@Entity('tool')
export class Tool {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    name: string;

    @ManyToMany(() => Subcompetency, (subcompetency) => subcompetency.tools)
    subcompetencies: Subcompetency[];
}