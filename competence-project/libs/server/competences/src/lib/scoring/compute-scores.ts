import {
  CompetencyScore,
  ComputeScoresOptions,
  IndicatorEvaluation,
  IndicatorScore,
  Score,
  ScoreReport,
  ScoringError,
  SubcompetencyScore,
} from './types';

export const MAX_RATING = 5;

const isIntInRange = (n: number, min: number, max: number): boolean =>
  Number.isInteger(n) && n >= min && n <= max;

const percentage = (obtained: number, max: number): number =>
  max === 0 ? 0 : (obtained / max) * 100;

function validate(ev: IndicatorEvaluation): void {
  const id = ev.indicatorId;
  const weights: Array<[string, number]> = [
    ['competencyWeight', ev.competencyWeight],
    ['subcompetencyWeight', ev.subcompetencyWeight],
    ['indicatorWeight', ev.indicatorWeight],
  ];
  for (const [name, value] of weights) {
    if (!isIntInRange(value, 1, 5)) {
      throw new ScoringError(`Indicatore ${id}: ${name} deve essere un intero 1..5 (ricevuto ${value})`);
    }
  }
  for (const r of ev.ratings) {
    if (!isIntInRange(r, 1, 5)) {
      throw new ScoringError(`Indicatore ${id}: rubric level deve essere un intero 1..5 (ricevuto ${r})`);
    }
    if (ev.yesNo && r !== 1 && r !== 5) {
      throw new ScoringError(`Indicatore ${id}: nei set yes/no sono ammessi solo 1 (no) e 5 (yes), ricevuto ${r}`);
    }
  }
}

/**
 * Calcola i punteggi secondo le slide:
 *   ottenuto = Σ (Pcomp + Psub + Pind) · RL
 *   massimo  = Σ (Pcomp + Psub + Pind) · 5
 *   %        = ottenuto / massimo · 100
 * Sotto-competenze e competenze sommano ottenuti e massimi (non fanno la media delle %).
 * Più valutatori sullo stesso indicatore: media non arrotondata + segnalazione di disaccordo.
 */
export function computeScores(
  evaluations: readonly IndicatorEvaluation[],
  options: ComputeScoresOptions = {},
): ScoreReport {
  const tolerance = options.tolerance ?? 0;
  const incomplete = options.incomplete ?? 'throw';

  const seenIndicators = new Set<number>();
  const competencyOfSub = new Map<number, number>();
  const competencyWeightOf = new Map<number, number>();
  const subcompetencyWeightOf = new Map<number, number>();

  const indicators: IndicatorScore[] = [];
  const inconsistentIndicatorIds: number[] = [];
  const missingIndicatorIds: number[] = [];

  const subAcc = new Map<number, { competencyId: number; obtained: number; max: number }>();
  const compAcc = new Map<number, { obtained: number; max: number }>();
  let totalObtained = 0;
  let totalMax = 0;

  for (const ev of evaluations) {
    if (seenIndicators.has(ev.indicatorId)) {
      throw new ScoringError(`Indicatore ${ev.indicatorId} presente più di una volta`);
    }
    seenIndicators.add(ev.indicatorId);

    const knownComp = competencyOfSub.get(ev.subcompetencyId);
    if (knownComp !== undefined && knownComp !== ev.competencyId) {
      throw new ScoringError(`La sotto-competenza ${ev.subcompetencyId} appartiene a più competenze`);
    }
    competencyOfSub.set(ev.subcompetencyId, ev.competencyId);

    validate(ev);

    // Lo stesso peso deve valere per tutti gli indicatori della stessa competenza/sotto-competenza
    const knownCompWeight = competencyWeightOf.get(ev.competencyId);
    if (knownCompWeight !== undefined && knownCompWeight !== ev.competencyWeight) {
      throw new ScoringError(
        `La competenza ${ev.competencyId} ha pesi diversi (${knownCompWeight} e ${ev.competencyWeight})`,
      );
    }
    competencyWeightOf.set(ev.competencyId, ev.competencyWeight);

    const knownSubWeight = subcompetencyWeightOf.get(ev.subcompetencyId);
    if (knownSubWeight !== undefined && knownSubWeight !== ev.subcompetencyWeight) {
      throw new ScoringError(
        `La sotto-competenza ${ev.subcompetencyId} ha pesi diversi (${knownSubWeight} e ${ev.subcompetencyWeight})`,
      );
    }
    subcompetencyWeightOf.set(ev.subcompetencyId, ev.subcompetencyWeight);

    if (ev.ratings.length === 0) {
      if (incomplete === 'throw') {
        throw new ScoringError(`Indicatore ${ev.indicatorId} non valutato`);
      }
      missingIndicatorIds.push(ev.indicatorId);
      continue;
    }

    const rating = ev.ratings.reduce((a, b) => a + b, 0) / ev.ratings.length;
    const disagreement = Math.max(...ev.ratings) - Math.min(...ev.ratings) > tolerance;
    if (disagreement) inconsistentIndicatorIds.push(ev.indicatorId);

    const w = ev.competencyWeight + ev.subcompetencyWeight + ev.indicatorWeight;
    const obtained = w * rating;
    const max = w * MAX_RATING;

    indicators.push({
      indicatorId: ev.indicatorId,
      subcompetencyId: ev.subcompetencyId,
      competencyId: ev.competencyId,
      rating,
      disagreement,
      obtained,
      max,
      percentage: percentage(obtained, max),
    });

    const sub = subAcc.get(ev.subcompetencyId) ?? { competencyId: ev.competencyId, obtained: 0, max: 0 };
    sub.obtained += obtained;
    sub.max += max;
    subAcc.set(ev.subcompetencyId, sub);

    const comp = compAcc.get(ev.competencyId) ?? { obtained: 0, max: 0 };
    comp.obtained += obtained;
    comp.max += max;
    compAcc.set(ev.competencyId, comp);

    totalObtained += obtained;
    totalMax += max;
  }

  const bySubcompetency: SubcompetencyScore[] = [...subAcc.entries()].map(([subcompetencyId, s]) => ({
    subcompetencyId,
    competencyId: s.competencyId,
    obtained: s.obtained,
    max: s.max,
    percentage: percentage(s.obtained, s.max),
  }));

  const byCompetency: CompetencyScore[] = [...compAcc.entries()].map(([competencyId, c]) => ({
    competencyId,
    obtained: c.obtained,
    max: c.max,
    percentage: percentage(c.obtained, c.max),
  }));

  const total: Score = {
    obtained: totalObtained,
    max: totalMax,
    percentage: percentage(totalObtained, totalMax),
  };

  return { total, bySubcompetency, byCompetency, indicators, inconsistentIndicatorIds, missingIndicatorIds };
}