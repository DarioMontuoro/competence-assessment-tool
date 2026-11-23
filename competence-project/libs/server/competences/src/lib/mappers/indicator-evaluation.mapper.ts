import type { Subcompetency } from '../entities/subcompetency.entity';
import type { RubricLevelAssignment } from '../entities/rubric-level-assignment.entity';
import type { IndicatorEvaluation } from '../scoring';

/**
 * Trasforma le entity caricate dal database nell'array "appiattito" che
 * computeScores si aspetta (un oggetto per indicatore).
 *
 * Relazioni che devono essere state caricate (altrimenti errore esplicito):
 *   subcompetencies: competency, observation_object → indicators → rubric_set
 *   assignments:     indicator
 *
 * Non tocca il database e non calcola nulla: solo riorganizza i dati.
 *
 * @param subcompetencies sotto-competenze del test
 * @param assignments     valutazioni (rubric_level_assignment) di UNA test_execution
 */
export function buildIndicatorEvaluations(
  subcompetencies: readonly Subcompetency[],
  assignments: readonly RubricLevelAssignment[],
): IndicatorEvaluation[] {
  // 1. Voti raggruppati per indicatore: un voto per ogni valutatore
  const ratingsByIndicator = new Map<number, number[]>();
  for (const a of assignments) {
    if (!a.indicator) {
      throw new Error(`rubric_level_assignment ${a.id}: relazione "indicator" non caricata`);
    }
    const ratings = ratingsByIndicator.get(a.indicator.id) ?? [];
    ratings.push(a.rubric_rank);
    ratingsByIndicator.set(a.indicator.id, ratings);
  }

  // 2. Un IndicatorEvaluation per ogni indicatore delle sotto-competenze del test
  const evaluations: IndicatorEvaluation[] = [];
  const knownIndicatorIds = new Set<number>();

  for (const sub of subcompetencies) {
    if (!sub.competency) {
      throw new Error(`Sotto-competenza ${sub.id}: relazione "competency" non caricata`);
    }
    const observationObject = sub.observation_object;
    if (!observationObject) {
      throw new Error(`Sotto-competenza ${sub.id}: manca l'oggetto di osservazione (o la relazione non è caricata)`);
    }
    if (!observationObject.indicators || observationObject.indicators.length === 0) {
      throw new Error(`Sotto-competenza ${sub.id}: l'oggetto di osservazione non ha indicatori`);
    }

    for (const ind of observationObject.indicators) {
      if (!ind.rubric_set) {
        throw new Error(`Indicatore ${ind.id}: relazione "rubric_set" non caricata`);
      }
      knownIndicatorIds.add(ind.id);

      evaluations.push({
        indicatorId: ind.id,
        subcompetencyId: sub.id,
        competencyId: sub.competency.id,
        competencyWeight: sub.competency.weight,
        subcompetencyWeight: sub.weight,
        indicatorWeight: ind.weight,
        yesNo: ind.rubric_set.yes_no,
        ratings: ratingsByIndicator.get(ind.id) ?? [],
      });
    }
  }

  // 3. Voti su indicatori che non fanno parte del test: dati incoerenti, meglio fermarsi
  for (const indicatorId of ratingsByIndicator.keys()) {
    if (!knownIndicatorIds.has(indicatorId)) {
      throw new Error(`Esiste una valutazione per l'indicatore ${indicatorId}, che non appartiene alle sotto-competenze del test`);
    }
  }

  return evaluations;
}