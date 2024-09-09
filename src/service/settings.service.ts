import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '@repositories/company.repository';
import { AdminAccountRepository } from '@repositories/admin-account.repository';
import { AdminAccountService } from './admin-account.service';
import {
  SettingsAccountDto,
  UpdateSettingsDto,
} from '@dto/setting/setting.dto';
import { NotFoundError } from '@exceptions/not-found.exception';
import { UnauthorizedError } from '@exceptions/unauthorized.exception';
import { AlreadyExistError } from '@exceptions/already-exist.exception';
import { CreateManagerDto } from '@dto/setting/create-manager-setting.dto';
import { RoleUtil } from '@utils/role.util';

@Injectable()
export class SettingsService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly adminAccountRepository: AdminAccountRepository,
    private readonly adminAccountService: AdminAccountService,
  ) {}

  // get user email, company name and other admins list for settings page
  public async getSettings(headers: Headers): Promise<SettingsAccountDto> {
    const customer = await this.adminAccountService.getCustomer(headers);
    if (!customer.roles.includes('admin'))
      throw new UnauthorizedError('Permission denied');
    let admins = await this.adminAccountRepository.findAllFromCompany(
      customer.company_id,
    );
    admins = admins.filter((managers) => !RoleUtil.isAdmin(managers));
    const company = await this.companyRepository.findById(customer.company_id);
    return new SettingsAccountDto(customer.email, company.name, admins);
  }

  // delete manager account from settings page
  public async deleteManager(
    headers: Headers,
    managerId: string,
  ): Promise<void> {
    const customer = await this.adminAccountService.getCustomer(headers);
    if (!customer.roles.includes('admin'))
      throw new UnauthorizedError('Permission denied');
    const manager = await this.adminAccountRepository.findUnique({
      id: managerId,
      company_id: customer.company_id,
    });
    if (!manager) throw new NotFoundError('Manager not found');

    // check that the manager to delete is not the admin
    if (RoleUtil.isAdmin(manager)) {
      throw new UnauthorizedError('Cannot delete admin');
    }
    await this.adminAccountRepository.delete(managerId);
  }

  // create manager account from settings page
  public async createManager(
    headers: Headers,
    CreateManagerDto: CreateManagerDto,
  ): Promise<void> {
    const customer = await this.adminAccountService.getCustomer(headers);
    if (!customer.roles.includes('admin'))
      throw new UnauthorizedError('Permission denied');
    const managerExists = await this.adminAccountRepository.findUnique({
      email: CreateManagerDto.email,
    });
    if (managerExists?.id)
      throw new AlreadyExistError('Manager already exists');
    await this.adminAccountRepository.createManager(
      customer.company_id,
      CreateManagerDto,
    );
  }

  // update company name from settings page
  public async updateSettings(
    headers: Headers,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<void> {
    const customer = await this.adminAccountService.getCustomer(headers);
    if (!customer.roles.includes('admin'))
      throw new UnauthorizedError('Permission denied');
    await this.companyRepository.update(customer.company_id, {
      name: updateSettingsDto.company_name,
    });
  }
}
