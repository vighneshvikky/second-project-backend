

export class CreateAvailabilityDto {
  date: string;
  slots: { start: string; end: string }[];
}


