import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateDiagnosticNoteDto {
  @IsNotEmpty({ message: 'WorkOrder ID is required' })
  @IsUUID('4', { message: 'WorkOrder ID must be a valid UUID' })
  workOrderId: string;

  @IsNotEmpty({ message: 'Note is required' })
  @IsString()
  @Length(10, 2000, {
    message: 'Note must be between 10 and 2000 characters',
  })
  note: string;
}

