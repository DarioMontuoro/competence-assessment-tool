import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Test } from './test.entity';

@Entity('test_designer')
export class TestDesigner {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false, unique: true }) // unique messo perchè quando poi assocerò uno user a un test_designer, mi aspetto che uno user non possa ricoprire più test designer, DA GESTIRE IN SEPARATA SEDE
    user_id: number;

    @OneToMany(() => Test, (test) => test.test_designer)
    tests: Test[];
}