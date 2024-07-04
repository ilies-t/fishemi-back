export default class HealthDto {
  public status: string;

  constructor(status: string) {
    this.status = status;
  }

  public static ok(): HealthDto {
    return new HealthDto('ok');
  }
}
