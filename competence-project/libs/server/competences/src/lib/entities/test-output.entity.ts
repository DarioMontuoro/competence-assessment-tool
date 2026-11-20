import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { TestExecution } from './test-execution.entity';

@Unique(['test_execution', 'name', 'version'])
@Entity('test_output')
export class TestOutput {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({ type: 'text', nullable: false })
    description: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    url: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    version: string;

    @ManyToOne(() => TestExecution, (test_execution) => test_execution.test_outputs, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'test_execution_id' })
    test_execution: TestExecution;
}