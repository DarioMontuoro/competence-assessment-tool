import { Module } from '@nestjs/common';
import { OrgCompetencesController } from './competences.controller';
import { OrgCompetencesService } from './competences.service';

@Module({
  controllers: [OrgCompetencesController],
  providers: [OrgCompetencesService],
  exports: [OrgCompetencesService],
})
export class OrgCompetencesModule {}
