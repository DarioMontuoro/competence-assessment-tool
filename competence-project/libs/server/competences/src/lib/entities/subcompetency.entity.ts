import { Entity, Column, PrimaryGeneratedColumn, Check, ManyToOne, ManyToMany, JoinColumn, Unique, JoinTable, OneToOne, OneToMany } from 'typeorm';
import { Competency } from './competency.entity';
import { Tool } from './tool.entity';
import { Method } from './method.entity';
import { Skill } from './skill.entity';
import { ObservationObject } from './observation-object.entity';
import { Test } from './test.entity';
import { BestSubcompetencyScore } from './best-subcompetency-score.entity';

@Entity('subcompetency')
@Check(`"weight" >= 1 AND "weight" <= 5`)
@Unique(['title', 'competency'])
export class Subcompetency {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title: string;

    @Column({ type: 'int', nullable: false })
    weight: number;

    @Column({ type: 'text', nullable: false })
    input: string;

    @Column({ type: 'text', nullable: false })
    output: string;

    @Column({ type: 'text', nullable: false })
    action: string;

    @ManyToOne(() => Competency, (competency) => competency.subcompetencies, {
        nullable: false,
        //eager: true,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'competency_id' })
    competency: Competency;

    @ManyToMany(() => Tool, (tool) => tool.subcompetencies, { cascade: false })
    @JoinTable({
        name: 'tool_subcompetency',
        joinColumn: { name: 'subcompetency_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tool_id', referencedColumnName: 'id' }
    })
    tools: Tool[];

    @ManyToMany(() => Method, (method) => method.subcompetencies, { cascade: false })
    @JoinTable({
        name: 'method_subcompetency',
        joinColumn: { name: 'subcompetency_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'method_id', referencedColumnName: 'id' }
    })
    methods: Method[];

    @ManyToMany(() => Skill, (skill) => skill.subcompetencies, { cascade: false })
    @JoinTable({
        name: 'skill_subcompetency',
        joinColumn: { name: 'subcompetency_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' }
    })
    skills: Skill[];

    @OneToOne(() => ObservationObject, (observation_object) => observation_object.subcompetency)
    observation_object: ObservationObject;

    @ManyToMany(() => Test, (test) => test.subcompetencies)
    tests: Test[];

    @OneToMany(() => BestSubcompetencyScore, (best_subcompetency_score) => best_subcompetency_score.subcompetency)
    best_subcompetency_scores: BestSubcompetencyScore[];
}