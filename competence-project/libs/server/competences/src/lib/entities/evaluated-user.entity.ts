import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BestCompetencyScore } from './best-competency-score.entity';
import { BestSubcompetencyScore } from './best-subcompetency-score.entity';
import { TestExecution } from './test-execution.entity';

@Entity('evaluated_user')
export class EvaluatedUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false, unique: true })
    user_id: number;

    @OneToMany(() => BestCompetencyScore, (best_competency_score) => best_competency_score.evaluated_user)
    best_competency_scores: BestCompetencyScore[];

    @OneToMany(() => BestSubcompetencyScore, (best_subcompetency_score) => best_subcompetency_score.evaluated_user)
    best_subcompetency_scores: BestSubcompetencyScore[];

    @OneToMany(() => TestExecution, (test_execution) => test_execution.evaluated_user)
    test_executions: TestExecution[];
}