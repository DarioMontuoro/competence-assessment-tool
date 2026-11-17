import { Controller } from '@nestjs/common';
import { OrgCompetencesService } from './competences.service';

@Controller('competences')
export class OrgCompetencesController {
  constructor(private orgCompetencesService: OrgCompetencesService) {}
}
