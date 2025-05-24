import { Controller, Get } from '@nestjs/common';
import { ReleaseService } from './release.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('release')
@Controller('release')
export class ReleaseController {
  constructor(private readonly releaseService: ReleaseService) {}

  @Get()
  async testGetRelease() {
    return await this.releaseService.testGetRelease();
  }
}
