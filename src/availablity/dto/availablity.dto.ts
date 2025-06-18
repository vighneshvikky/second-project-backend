export class SetAvailabilityDto {
  trainerId: string;
  date: string;
  slots: { start: string; end: string }[];
}

export class CreateAvailabilityDto {
  date: string;
  slots: string[];
}


