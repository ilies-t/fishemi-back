import globalConfig from '@config/global.config';

export class NumberUtil {
  public static roundUpTo2Decimals(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  public static addFrVat(value: number): number {
    return NumberUtil.roundUpTo2Decimals(
      value * (1 + globalConfig().franceVatRate / 100),
    );
  }
}
