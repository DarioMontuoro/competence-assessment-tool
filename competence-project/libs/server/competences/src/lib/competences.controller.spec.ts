import { Test } from '@nestjs/testing';
import { OrgCompetencesController } from './competences.controller';
import { OrgCompetencesService } from './competences.service';

describe('OrgCompetencesController', () => {
  let controller: OrgCompetencesController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OrgCompetencesService],
      controllers: [OrgCompetencesController],
    }).compile();

    controller = module.get(OrgCompetencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
