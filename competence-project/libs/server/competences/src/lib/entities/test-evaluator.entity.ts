import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { Test } from './test.entity';
import { RubricLevelAssignment } from './rubric-level-assignment.entity';

@Entity('test_evaluator')
export class TestEvaluator {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false, unique: true }) // unique messo perchè quando poi assocerò uno user a un test_evaluator, mi aspetto che uno user non possa ricoprire più valutatori, DA GESTIRE IN SEPARATA SEDE
    user_id: number;

    @ManyToMany(() => Test, (test) => test.test_evaluators)
    tests: Test[];

    @OneToMany(() => RubricLevelAssignment, (rubric_level_assignment) => rubric_level_assignment.test_evaluator)
    rubric_level_assignments: RubricLevelAssignment[];
}