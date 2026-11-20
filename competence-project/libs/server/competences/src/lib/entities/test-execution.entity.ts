import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany, Check } from 'typeorm';
import { Test } from './test.entity';
import { TestOutput } from './test-output.entity';
import { RubricLevelAssignment } from './rubric-level-assignment.entity';
import { EvaluatedUser } from './evaluated-user.entity';
import { numericTransformer } from './common/transformers/numeric.transformer';


@Entity('test_execution')
@Check(`"max_score" >= 0 AND "test_score" >= 0 AND "test_score" <= "max_score"`)
export class TestExecution {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'numeric', nullable: false, transformer: numericTransformer })
    test_score: number;

    @Column({ type: 'numeric', nullable: false, transformer: numericTransformer })
    max_score: number;

    @ManyToOne(() => Test, (test) => test.test_executions, {
        nullable: false,
        //eager: true,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'test_id' })
    test: Test;

    @OneToMany(() => TestOutput, (test_output) => test_output.test_execution)
    test_outputs: TestOutput[];

    @OneToMany(() => RubricLevelAssignment, (rubric_level_assignment) => rubric_level_assignment.test_execution)
    rubric_level_assignments: RubricLevelAssignment[];

    @ManyToOne(() => EvaluatedUser, (evaluated_user) => evaluated_user.test_executions, {
        nullable: false,
        //eager: true,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'user_id' })
    evaluated_user: EvaluatedUser;
}