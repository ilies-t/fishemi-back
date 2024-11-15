import { Injectable, Logger } from '@nestjs/common';
import { ListRepository } from '@repositories/list.repository';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { ListDto, returnListDto, UpdateListDto } from '@dto/list/list.dto';
import { CreateListDto } from '@dto/list/create-list.dto';
import { ManageEmployeeListDto } from '@dto/list/manage-employee-list.dto';
import { BadRequestException } from '@exceptions/bad-request.exception';

@Injectable()
export class ListService {
  private readonly logger = new Logger(ListService.name);

  constructor(
    private readonly listRepo: ListRepository,
    private readonly jwtAccessService: JwtAccessService,
  ) {}

  public async findAll(headers: Headers): Promise<returnListDto[]> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const lists = await this.listRepo.findAll(jwt.companyId);
    return lists.map((list) => new returnListDto(list, list['employee_lists']));
  }

  public async create(headers: Headers, body: CreateListDto): Promise<ListDto> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const list = await this.listRepo.create(jwt.companyId, body.name);
    this.logger.log(`List successfully created, id=${list.id}`);
    return new ListDto(list);
  }

  public async addEmployeeIntoList(
    headers: Headers,
    body: ManageEmployeeListDto,
  ): Promise<void> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);

    try {
      await this.listRepo.addEmployeeIntoList(
        body.list_id,
        body.employee_id,
        jwt.companyId,
      );
      this.logger.log(
        `Employee successfully added to list, listId=${body.list_id}, employeeId=${body.employee_id}`,
      );
    } catch (error) {
      this.logger.warn(`Error adding employee to list, error=${error.message}`);
      throw new BadRequestException(
        "L'employé est déjà présent dans la liste.",
      );
    }
  }

  public async deleteEmployeeFromList(
    headers: Headers,
    body: ManageEmployeeListDto,
  ): Promise<void> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    try {
      await this.listRepo.deleteEmployeeFromList(
        body.list_id,
        body.employee_id,
        jwt.companyId,
      );
      this.logger.log(
        `Employee successfully removed from list, listId=${body.list_id}, employeeId=${body.employee_id}`,
      );
    } catch (error) {
      this.logger.warn(
        `Error deleting employee from list, error=${error.message}`,
      );
      throw new BadRequestException(
        "L'employé n'est pas présent dans la liste.",
      );
    }
  }

  public async search(
    headers: Headers,
    searchElement: string,
  ): Promise<returnListDto[]> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const lists = await this.listRepo.search(jwt.companyId, searchElement);
    return lists.map((list) => new returnListDto(list, list['employee_lists']));
  }

  public async update(
    headers: Headers,
    body: UpdateListDto,
  ): Promise<returnListDto> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const list = await this.listRepo.update(jwt.companyId, body);
    this.logger.log(`List name successfully updated, id=${list.id}`);
    await this.listRepo.updateEmployeeList(body, jwt.companyId);
    const updatedList = await this.listRepo.findById(jwt.companyId, list.id);
    return new returnListDto(updatedList, updatedList['employee_lists']);
  }

  public async delete(headers: Headers, listId: string): Promise<void> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    // check if list is used in any campaign
    const isUsed = await this.listRepo.checkListIsUsedInCampaign(listId);
    if (isUsed) {
      throw new BadRequestException(
        'La liste est utilisée dans une campagne, impossible de la supprimer.',
      );
    }
    await this.listRepo.delete(jwt.companyId, listId);
    this.logger.log(`List successfully deleted, id=${listId}`);
  }
}
