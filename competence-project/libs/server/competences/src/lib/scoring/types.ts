/**
 * Input del calcolo: un indicatore già "appiattito" dalle entity.
 */
export interface IndicatorEvaluation {
  indicatorId: number;
  subcompetencyId: number;
  competencyId: number;
  competencyWeight: number; // Pcomp (1..5)
  subcompetencyWeight: number; // Psub (1..5)
  indicatorWeight: number; // Pind (1..5)
  /** true se il rubric_set è yes/no: sono ammessi solo i rank 1 e 5 */
  yesNo?: boolean;
  /** Un rubric_rank (1..5) per ogni valutatore. [] = indicatore non valutato */
  ratings: readonly number[];
}

export interface Score {
  obtained: number;
  max: number;
  percentage: number;
}

export interface IndicatorScore extends Score {
  indicatorId: number;
  subcompetencyId: number;
  competencyId: number;
  rating: number;
  disagreement: boolean;
}

export interface SubcompetencyScore extends Score {
  subcompetencyId: number;
  competencyId: number;
}

export interface CompetencyScore extends Score {
  competencyId: number;
}

export interface ScoreReport {
  /** Va in test_execution.test_score / max_score */
  total: Score;
  bySubcompetency: SubcompetencyScore[];
  byCompetency: CompetencyScore[];
  indicators: IndicatorScore[];
  /** Indicatori su cui i valutatori non concordano */
  inconsistentIndicatorIds: number[];
  /** Indicatori senza voti (solo con incomplete: 'skip') */
  missingIndicatorIds: number[];
}

export interface ComputeScoresOptions {
  /** Differenza max-min tra valutatori oltre la quale si segnala incongruenza. Default 0 */
  tolerance?: number;
  /** 'throw' (default): errore se un indicatore non ha voti. 'skip': lo esclude dal calcolo */
  incomplete?: 'throw' | 'skip';
}

export class ScoringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScoringError';
  }
}