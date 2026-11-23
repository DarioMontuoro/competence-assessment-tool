import { computeScores, IndicatorEvaluation, ScoringError } from './index';

// C1 (peso 3): S1 (peso 2): I1 peso 4 voto 5, I2 peso 1 voto 3 | S2 (peso 5): I3 peso 2 voto 1
// C2 (peso 1): S3 (peso 1): I4 peso 1 yes/no voto 5
const example = (): IndicatorEvaluation[] => [
  { indicatorId: 1, subcompetencyId: 1, competencyId: 1, competencyWeight: 3, subcompetencyWeight: 2, indicatorWeight: 4, ratings: [5] },
  { indicatorId: 2, subcompetencyId: 1, competencyId: 1, competencyWeight: 3, subcompetencyWeight: 2, indicatorWeight: 1, ratings: [3] },
  { indicatorId: 3, subcompetencyId: 2, competencyId: 1, competencyWeight: 3, subcompetencyWeight: 5, indicatorWeight: 2, ratings: [1] },
  { indicatorId: 4, subcompetencyId: 3, competencyId: 2, competencyWeight: 1, subcompetencyWeight: 1, indicatorWeight: 1, yesNo: true, ratings: [5] },
];

describe('computeScores', () => {
  it('riproduce i valori calcolati a mano', () => {
    const r = computeScores(example());
    const sub = (id: number) => r.bySubcompetency.find((s) => s.subcompetencyId === id)!;
    const comp = (id: number) => r.byCompetency.find((c) => c.competencyId === id)!;

    expect(sub(1)).toMatchObject({ obtained: 63, max: 75 });
    expect(sub(1).percentage).toBeCloseTo(84);
    expect(sub(2)).toMatchObject({ obtained: 10, max: 50 });
    expect(sub(2).percentage).toBeCloseTo(20);
    expect(sub(3)).toMatchObject({ obtained: 15, max: 15, percentage: 100 });
    expect(comp(1)).toMatchObject({ obtained: 73, max: 125 });
    expect(comp(1).percentage).toBeCloseTo(58.4);
    expect(r.total).toMatchObject({ obtained: 88, max: 140 });
    expect(r.total.percentage).toBeCloseTo(62.857, 3);
    expect(r.inconsistentIndicatorIds).toEqual([]);
  });

  it('con più valutatori fa la media e segnala il disaccordo', () => {
    const evs = example();
    evs[0] = { ...evs[0], ratings: [5, 4] }; // w = 9 → media 4.5 → 40.5
    const r = computeScores(evs);
    expect(r.indicators[0].rating).toBe(4.5);
    expect(r.indicators[0].obtained).toBe(40.5);
    expect(r.inconsistentIndicatorIds).toEqual([1]);
  });

  it('la tolleranza evita la segnalazione', () => {
    const evs = example();
    evs[0] = { ...evs[0], ratings: [5, 4] };
    expect(computeScores(evs, { tolerance: 1 }).inconsistentIndicatorIds).toEqual([]);
  });

  it('rifiuta un indicatore non valutato per default', () => {
    const evs = example();
    evs[1] = { ...evs[1], ratings: [] };
    expect(() => computeScores(evs)).toThrow(ScoringError);
  });

  it("con incomplete: 'skip' esclude l'indicatore da ottenuto e massimo", () => {
    const evs = example();
    evs[1] = { ...evs[1], ratings: [] }; // toglie 18 / 30
    const r = computeScores(evs, { incomplete: 'skip' });
    expect(r.missingIndicatorIds).toEqual([2]);
    expect(r.total).toMatchObject({ obtained: 70, max: 110 });
  });

  it('valida pesi, rank e yes/no', () => {
    const base = example();
    expect(() => computeScores([{ ...base[0], ratings: [6] }])).toThrow(ScoringError);
    expect(() => computeScores([{ ...base[0], indicatorWeight: 0 }])).toThrow(ScoringError);
    expect(() => computeScores([{ ...base[3], ratings: [3] }])).toThrow(ScoringError);
  });

  it('con input vuoto restituisce zeri senza dividere per zero', () => {
    const r = computeScores([]);
    expect(r.total).toEqual({ obtained: 0, max: 0, percentage: 0 });
    expect(r.bySubcompetency).toEqual([]);
    expect(r.byCompetency).toEqual([]);
  });

  it('con tre valutatori usa la media non arrotondata', () => {
    const evs = example();
    evs[0] = { ...evs[0], ratings: [5, 4, 3] }; // media 4, differenza 2
    const r = computeScores(evs);
    expect(r.indicators[0].rating).toBe(4);
    expect(r.indicators[0].obtained).toBe(36); // w = 9
    expect(r.inconsistentIndicatorIds).toEqual([1]);

    evs[0] = { ...evs[0], ratings: [5, 5, 4] }; // media 4.666...
    expect(computeScores(evs).indicators[0].rating).toBeCloseTo(14 / 3);
  });

  it('in un set yes/no due valutatori in disaccordo danno media 3 e una segnalazione', () => {
    const evs = example();
    evs[3] = { ...evs[3], ratings: [1, 5] };
    const r = computeScores(evs);
    expect(r.indicators[3].rating).toBe(3);
    expect(r.inconsistentIndicatorIds).toEqual([4]);
  });

  it("con incomplete: 'skip' e nessun voto il totale è zero", () => {
    const evs = example().map((e) => ({ ...e, ratings: [] }));
    const r = computeScores(evs, { incomplete: 'skip' });
    expect(r.missingIndicatorIds).toEqual([1, 2, 3, 4]);
    expect(r.total).toEqual({ obtained: 0, max: 0, percentage: 0 });
  });

  it('rifiuta voti non interi e pesi non interi', () => {
    const base = example();
    expect(() => computeScores([{ ...base[0], ratings: [3.5] }])).toThrow(ScoringError);
    expect(() => computeScores([{ ...base[0], competencyWeight: 2.5 }])).toThrow(ScoringError);
  });

  it('rifiuta pesi incoerenti per la stessa competenza o sotto-competenza', () => {
    const base = example();
    // stessa competenza 1, peso diverso
    expect(() => computeScores([base[0], { ...base[2], competencyWeight: 4 }])).toThrow(ScoringError);
    // stessa sotto-competenza 1, peso diverso
    expect(() => computeScores([base[0], { ...base[1], subcompetencyWeight: 3 }])).toThrow(ScoringError);
  });

  it('rifiuta indicatori duplicati e sotto-competenze in due competenze', () => {
    const base = example();
    expect(() => computeScores([base[0], base[0]])).toThrow(ScoringError);
    expect(() => computeScores([base[0], { ...base[1], competencyId: 9 }])).toThrow(ScoringError);
  });
});