import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from '@services/settings.service';
import { CompanyRepository } from '@repositories/company.repository';
import { AdminAccountRepository } from '@repositories/admin-account.repository';
import { AdminAccountService } from '@services/admin-account.service';
import { SettingsAccountDto } from '@dto/setting/setting.dto';
import { NotFoundError } from '@exceptions/not-found.exception';
import { UnauthorizedError } from '@exceptions/unauthorized.exception';
import { AlreadyExistError } from '@exceptions/already-exist.exception';
import { CreateManagerDto } from '@dto/setting/setting.dto';

describe('SettingsService', () => {
  let service: SettingsService;
  let companyRepository: CompanyRepository;
  let adminAccountRepository: AdminAccountRepository;
  let adminAccountService: AdminAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: CompanyRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: AdminAccountRepository,
          useValue: {
            findAllFromCompany: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            createManager: jest.fn(),
          },
        },
        {
          provide: AdminAccountService,
          useValue: {
            getCustomer: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    companyRepository = module.get<CompanyRepository>(CompanyRepository);
    adminAccountRepository = module.get<AdminAccountRepository>(
      AdminAccountRepository,
    );
    adminAccountService = module.get<AdminAccountService>(AdminAccountService);
  });

  describe('getSettings', () => {
    it('should return settings data if user is an admin', async () => {
      const mockCustomer = {
        email: 'admin@example.com',
        roles: ['admin'],
        company_id: 'company1',
      };
      const mockCompany = { id: 'company1', name: 'Company One' };
      const mockAdmins = [{ id: 'admin1', email: 'admin1@example.com' }];

      jest
        .spyOn(adminAccountService, 'getCustomer')
        .mockResolvedValue(mockCustomer as any);
      jest
        .spyOn(companyRepository, 'findById')
        .mockResolvedValue(mockCompany as any);
      jest
        .spyOn(adminAccountRepository, 'findAllFromCompany')
        .mockResolvedValue(mockAdmins as any);

      const result = await service.getSettings({} as Headers);

      expect(result).toEqual(
        new SettingsAccountDto(
          mockCustomer.email,
          mockCompany.name,
          mockAdmins as any,
        ),
      );
    });

    it('should throw UnauthorizedError if user is not an admin', async () => {
      const mockCustomer = {
        email: 'user@example.com',
        roles: ['user'],
        company_id: 'company1',
      };
      jest
        .spyOn(adminAccountService, 'getCustomer')
        .mockResolvedValue(mockCustomer as any);

      await expect(service.getSettings({} as Headers)).rejects.toThrow(
        UnauthorizedError,
      );
    });
  });

  describe('deleteManager', () => {
    it('should delete manager if user is an admin', async () => {
      const mockCustomer = {
        email: 'admin@example.com',
        roles: ['admin'],
        company_id: 'company1',
      };
      const mockManager = { id: 'manager1', company_id: 'company1' };

      jest
        .spyOn(adminAccountService, 'getCustomer')
        .mockResolvedValue(mockCustomer as any);
      jest
        .spyOn(adminAccountRepository, 'findUnique')
        .mockResolvedValue(mockManager as any);
      jest.spyOn(adminAccountRepository, 'delete').mockResolvedValue(undefined);

      await service.deleteManager({} as Headers, 'manager1');

      expect(adminAccountRepository.delete).toHaveBeenCalledWith('manager1');
    });

    it('should throw UnauthorizedError if user is not an admin', async () => {
      const mockCustomer = {
        email: 'user@example.com',
        roles: ['user'],
        company_id: 'company1',
      };
      jest
        .spyOn(adminAccountService, 'getCustomer')
        .mockResolvedValue(mockCustomer as any);

      await expect(
        service.deleteManager({} as Headers, 'manager1'),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw NotFoundError if manager is not found', async () => {
      const mockCustomer = {
        email: 'admin@example.com',
        roles: ['admin'],
        company_id: 'company1',
      };

      jest
        .spyOn(adminAccountService, 'getCustomer')
        .mockResolvedValue(mockCustomer as any);
      jest.spyOn(adminAccountRepository, 'findUnique').mockResolvedValue(null);

      await expect(
        service.deleteManager({} as Headers, 'manager1'),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('createManager', () => {
    it('should create a manager if user is an admin', async () => {
      const mockCustomer = {
        email: 'admin@example.com',
        roles: ['admin'],
        company_id: 'company1',
      };
      const mockCreateManagerDto = {
        email: 'manager@example.com',
      } as CreateManagerDto;

      jest
        .spyOn(adminAccountService, 'getCustomer')
        .mockResolvedValue(mockCustomer as any);
      jest.spyOn(adminAccountRepository, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(adminAccountRepository, 'createManager')
        .mockResolvedValue(undefined);

      await service.createManager({} as Headers, mockCreateManagerDto);

      expect(adminAccountRepository.createManager).toHaveBeenCalledWith(
        'company1',
        mockCreateManagerDto,
      );
    });

    it('should throw UnauthorizedError if user is not an admin', async () => {
      const mockCustomer = {
        email: 'user@example.com',
        roles: ['user'],
        company_id: 'company1',
      };
      const mockCreateManagerDto = {
        email: 'manager@example.com',
      } as CreateManagerDto;

      jest
        .spyOn(adminAccountService, 'getCustomer')
        .mockResolvedValue(mockCustomer as any);

      await expect(
        service.createManager({} as Headers, mockCreateManagerDto),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw AlreadyExistError if manager already exists', async () => {
      const mockCustomer = {
        email: 'admin@example.com',
        roles: ['admin'],
        company_id: 'company1',
      };
      const mockCreateManagerDto = {
        email: 'manager@example.com',
      } as CreateManagerDto;
      const mockManagerExists = {
        id: 'manager1',
        email: 'manager@example.com',
      };

      jest
        .spyOn(adminAccountService, 'getCustomer')
        .mockResolvedValue(mockCustomer as any);
      jest
        .spyOn(adminAccountRepository, 'findUnique')
        .mockResolvedValue(mockManagerExists as any);

      await expect(
        service.createManager({} as Headers, mockCreateManagerDto),
      ).rejects.toThrow(AlreadyExistError);
    });
  });
});
