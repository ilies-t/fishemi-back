import { NumberUtil } from '@utils/number.util';

describe('NumberUtil', () => {
  it('Should round numbers', async () => {
    expect(NumberUtil.roundUpTo2Decimals(1.240000000000005)).toEqual(1.24);
    expect(NumberUtil.roundUpTo2Decimals(1.245)).toEqual(1.25);
  });
  it('Should add french VAT', async () => {
    expect(NumberUtil.addFrVat(100)).toEqual(120);
  });
});
