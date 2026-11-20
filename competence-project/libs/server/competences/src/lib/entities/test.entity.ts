import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Subcompetency } from './subcompetency.entity';
import { TestDesigner } from './test-designer.entity';
import { TestEvaluator } from './test-evaluator.entity';
import { TestExecution } from './test-execution.entity';

@Entity('test')
export class Test {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: false })
    assessment_situation: string;

    @ManyToMany(() => Subcompetency, (subcompetency) => subcompetency.tests)
    @JoinTable({
        name: 'test_subcompetency',
        joinColumn: { name: 'test_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subcompetency_id', referencedColumnName: 'id' }
    })
    subcompetencies: Subcompetency[];

    @ManyToOne(() => TestDesigner, (test_designer) => test_designer.tests, {
        nullable: false,
        //eager: true,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'test_designer_id' })
    test_designer: TestDesigner;

    @ManyToMany(() => TestEvaluator, (test_evaluator) => test_evaluator.tests)
    @JoinTable({
        name: 'test_evaluator_test',
        joinColumn: { name: 'test_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'test_evaluator_id', referencedColumnName: 'id' }
    })
    test_evaluators: TestEvaluator[];

    @OneToMany(() => TestExecution, (test_execution) => test_execution.test)
    test_executions: TestExecution[];
}