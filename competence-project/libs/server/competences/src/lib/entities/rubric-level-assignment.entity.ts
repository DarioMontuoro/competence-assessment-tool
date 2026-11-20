import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Check, Unique } from 'typeorm';
import { Indicator } from './indicator.entity';
import { TestEvaluator } from './test-evaluator.entity';
import { TestExecution } from './test-execution.entity';

@Unique(['indicator', 'test_evaluator', 'test_execution'])
@Entity('rubric_level_assignment')
@Check(`"rubric_rank" >= 1 AND "rubric_rank" <= 5`)
export class RubricLevelAssignment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    rubric_rank: number;

    @ManyToOne(() => Indicator, (indicator) => indicator.rubric_level_assignments, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'indicator_id' })
    indicator: Indicator;

    @ManyToOne(() => TestEvaluator, (test_evaluator) => test_evaluator.rubric_level_assignments, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'evaluator_id' })
    test_evaluator: TestEvaluator;

    @ManyToOne(() => TestExecution, (test_execution) => test_execution.rubric_level_assignments, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'test_execution_id' })
    test_execution: TestExecution;
}