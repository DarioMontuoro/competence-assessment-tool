import { buildIndicatorEvaluations } from './indicator-evaluation.mapper';
import { computeScores } from '../scoring';
import type { Subcompetency } from '../entities/subcompetency.entity';
import type { RubricLevelAssignment } from '../entities/rubric-level-assignment.entity';

// Stessa matrice dell'esempio a mano, ma nella forma "espansa" delle entity
const standard = { id: 1, yes_no: false };
const yesNo = { id: 2, yes_no: true };
const c1 = { id: 1, weight: 3 };
const c2 = { id: 2, weight: 1 };
const ind = (id: number, weight: number, rubric_set: object) => ({ id, weight, rubric_set });

const makeSubs = () =>
  [
    { id: 1, weight: 2, competency: c1, observation_object: { indicators: [ind(1, 4, standard), ind(2, 1, standard)] } },
    { id: 2, weight: 5, competency: c1, observation_object: { indicators: [ind(3, 2, standard)] } },
    { id: 3, weight: 1, competency: c2, observation_object: { indicators: [ind(4, 1, yesNo)] } },
  ] as unknown as Subcompetency[];

const vote = (id: number, indicatorId: number, rubric_rank: number) => ({
  id,
  rubric_rank,
  indicator: { id: indicatorId },
});

const makeAssignments = () =>
  [vote(1, 1, 5), vote(2, 2, 3), vote(3, 3, 1), vote(4, 4, 5)] as unknown as RubricLevelAssignment[];

describe('buildIndicatorEvaluations', () => {
  it("produce l'array appiattito atteso", () => {
    expect(buildIndicatorEvaluations(makeSubs(), makeAssignments())).toEqual([
      { indicatorId: 1, subcompetencyId: 1, competencyId: 1, competencyWeight: 3, subcompetencyWeight: 2, indicatorWeight: 4, yesNo: false, ratings: [5] },
      { indicatorId: 2, subcompetencyId: 1, competencyId: 1, competencyWeight: 3, subcompetencyWeight: 2, indicatorWeight: 1, yesNo: false, ratings: [3] },
      { indicatorId: 3, subcompetencyId: 2, competencyId: 1, competencyWeight: 3, subcompetencyWeight: 5, indicatorWeight: 2, yesNo: false, ratings: [1] },
      { indicatorId: 4, subcompetencyId: 3, competencyId: 2, competencyWeight: 1, subcompetencyWeight: 1, indicatorWeight: 1, yesNo: true, ratings: [5] },
    ]);
  });

  it('insieme a computeScores riproduce 88/140', () => {
    const report = computeScores(buildIndicatorEvaluations(makeSubs(), makeAssignments()));
    expect(report.total).toMatchObject({ obtained: 88, max: 140 });
    expect(report.total.percentage).toBeCloseTo(62.857, 3);
  });

  it('raggruppa i voti di più valutatori sullo stesso indicatore', () => {
    const assignments = [...makeAssignments(), vote(5, 1, 4)] as unknown as RubricLevelAssignment[];
    const result = buildIndicatorEvaluations(makeSubs(), assignments);
    expect(result[0].ratings).toEqual([5, 4]);
  });

  it('un indicatore senza voti ha ratings vuoto', () => {
    const assignments = makeAssignments().slice(0, 3); // manca il voto di I4
    const result = buildIndicatorEvaluations(makeSubs(), assignments);
    expect(result[3].ratings).toEqual([]);
  });

  it('segnala le relazioni non caricate', () => {
    const noCompetency = makeSubs();
    (noCompetency[0] as unknown as { competency?: unknown }).competency = undefined;
    expect(() => buildIndicatorEvaluations(noCompetency, makeAssignments())).toThrow(/competency/);

    const noObject = makeSubs();
    (noObject[1] as unknown as { observation_object?: unknown }).observation_object = undefined;
    expect(() => buildIndicatorEvaluations(noObject, makeAssignments())).toThrow(/oggetto di osservazione/);

    const noIndicator = [{ id: 7, assignment: true }] as unknown as RubricLevelAssignment[];
    expect(() => buildIndicatorEvaluations(makeSubs(), noIndicator)).toThrow(/indicator/);
  });

  it('rifiuta voti su indicatori che non fanno parte del test', () => {
    const assignments = [...makeAssignments(), vote(9, 99, 3)] as unknown as RubricLevelAssignment[];
    expect(() => buildIndicatorEvaluations(makeSubs(), assignments)).toThrow(/99/);
  });
});