import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique, Check } from 'typeorm';
import { EvaluatedUser } from './evaluated-user.entity';
import { Competency } from './competency.entity';
import { numericTransformer } from './common/transformers/numeric.transformer';

@Unique(['evaluated_user', 'competency'])
@Entity('best_competency_score')
@Check(`"best_score_absolute" >= 0 AND "best_score_percentage" >= 0 AND "best_score_percentage" <= 100`)
export class BestCompetencyScore {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    best_score_absolute: number;

    @Column({ type: 'numeric', precision: 5, scale: 2, nullable: false, transformer: numericTransformer })
    best_score_percentage: number;

    @ManyToOne(() => EvaluatedUser, (evaluated_user) => evaluated_user.best_competency_scores, {
        nullable: false,
        onDelete: 'RESTRICT'
    })
    @JoinColumn({ name: 'user_id' })
    evaluated_user: EvaluatedUser;

    @ManyToOne(() => Competency, (competency) => competency.best_competency_scores, {
        nullable: false,
        onDelete: 'RESTRICT'
    })
    @JoinColumn({ name: 'competency_id' })
    competency: Competency;
}