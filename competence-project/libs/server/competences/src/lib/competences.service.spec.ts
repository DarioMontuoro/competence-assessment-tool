import { Test } from '@nestjs/testing';
import { OrgCompetencesService } from './competences.service';

describe('OrgCompetencesService', () => {
  let service: OrgCompetencesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OrgCompetencesService],
    }).compile();

    service = module.get(OrgCompetencesService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
