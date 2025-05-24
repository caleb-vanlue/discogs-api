import { Inject, Injectable } from '@nestjs/common';
import { ReleaseRepository } from './release.repository';

@Injectable()
export class ReleaseService {
  constructor(private readonly releaseRepository: ReleaseRepository) {}

  async testGetRelease() {
    return await this.releaseRepository.findAll();
  }
}
