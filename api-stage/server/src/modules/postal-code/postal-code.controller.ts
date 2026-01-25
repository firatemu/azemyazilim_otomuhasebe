import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PostalCodeService } from './postal-code.service';

@Controller('postal-codes')
@UseGuards(JwtAuthGuard)
export class PostalCodeController {
  constructor(private readonly postalCodeService: PostalCodeService) {}

  /**
   * İl, ilçe ve mahalle bilgisine göre posta kodunu getirir
   * GET /postal-codes?city=İstanbul&district=Kadıköy&neighborhood=Fenerbahçe
   */
  @Get()
  async getPostalCode(
    @Query('city') city?: string,
    @Query('district') district?: string,
    @Query('neighborhood') neighborhood?: string,
  ) {
    if (!city || !district || !neighborhood) {
      throw new HttpException(
        'city, district ve neighborhood parametreleri zorunludur',
        HttpStatus.BAD_REQUEST,
      );
    }

    const postalCode = await this.postalCodeService.findPostalCode(
      city,
      district,
      neighborhood,
    );

    return {
      city,
      district,
      neighborhood,
      postalCode,
      found: !!postalCode,
    };
  }
}
