import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesAgentDto } from './create-sales-agent.dto';

export class UpdateSalesAgentDto extends PartialType(CreateSalesAgentDto) { }
