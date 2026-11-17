import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Subcompetency } from './subcompetency.entity';

@Entity('method')
export class Method {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    name: string;

    @ManyToMany(() => Subcompetency, (subcompetency) => subcompetency.methods)
    subcompetencies: Subcompetency[];
}