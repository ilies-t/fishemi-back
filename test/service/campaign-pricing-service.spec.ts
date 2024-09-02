import { PrismaService } from '@services/prisma.service';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { ListRepository } from '@repositories/list.repository';
import { CampaignPricingService } from '@services/campaign/campaign-pricing.service';
import { JwtInterface } from '@interfaces/jwt.interface';
import { BadRequestException } from '@exceptions/bad-request.exception';
import globalConfig from '@config/global.config';

describe('CampaignPricingService', () => {
  let jwtAccessService: JwtAccessService;
  let listRepo: ListRepository;
  let campaignPricingService: CampaignPricingService;

  beforeEach(() => {
    jwtAccessService = new JwtAccessService();
    listRepo = new ListRepository(new PrismaService());
    campaignPricingService = new CampaignPricingService(
      jwtAccessService,
      listRepo,
      null,
      null,
      null,
      null,
      null,
    );
  });

  it('Should calculate campaign price with 2 employees', async () => {
    // given
    const body = {
      lists: ['listId1', 'listId2'],
    };

    // when
    jest.spyOn(jwtAccessService, 'getJwtFromHeaders').mockImplementation(() => {
      return { companyId: 'companyId' } as JwtInterface;
    });
    jest.spyOn(listRepo, 'findManyById').mockImplementation(
      () =>
        [
          {
            id: 'listId1',
            employee_lists: [
              {
                employee: {
                  id: 'employeeListId1',
                },
              },
              {
                employee: {
                  id: 'employeeListId2',
                },
              },
            ],
          },
          {
            id: 'listId2',
            employee_lists: [],
          },
          {
            id: 'listId3',
            employee_lists: [
              {
                employee: {
                  id: 'employeeListId2',
                },
              },
            ],
          },
        ] as any,
    );
    const result = await campaignPricingService.calculate(null, body);

    // then
    const expected = globalConfig().eurExcludingTaxPricePerEmployee * 2;
    expect(result.eurosExcludingTaxTotal).toBe(expected);
  });

  it('Should calculate campaign price and throw error', () => {
    // given
    const body = {
      lists: ['listId1', 'listId2'],
    };

    // when
    jest.spyOn(jwtAccessService, 'getJwtFromHeaders').mockImplementation(() => {
      return { companyId: 'companyId' } as JwtInterface;
    });
    jest.spyOn(listRepo, 'findManyById').mockImplementation(
      () =>
        [
          {
            id: 'listId1',
            employee_lists: [],
          },
          {
            id: 'listId2',
            employee_lists: [],
          },
        ] as any,
    );
    expect(async () => {
      await campaignPricingService.calculate(null, body);
    }).rejects.toThrow(BadRequestException);
  });

  it('Should calculate campaign price and throw error because of empty list', () => {
    // given
    const body = {
      lists: ['listId1', 'listId2'],
    };

    // when
    jest.spyOn(jwtAccessService, 'getJwtFromHeaders').mockImplementation(() => {
      return { companyId: 'companyId' } as JwtInterface;
    });
    jest.spyOn(listRepo, 'findManyById').mockImplementation(() => [] as any);
    expect(async () => {
      await campaignPricingService.calculate(null, body);
    }).rejects.toThrow(BadRequestException);
  });
});
