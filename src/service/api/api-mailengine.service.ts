import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import globalConfig from '@config/global.config';
import { ServiceUnavailableException } from '@exceptions/service-unavailable.exception';

@Injectable()
export class ApiMailengineService {
  private readonly logger = new Logger(ApiMailengineService.name);
  public client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: globalConfig().mailengineBaseUrl,
    });
  }

  public async getClickedFormContent(companyName: string): Promise<string> {
    return this.client
      .get<string>(`/html-render-fished?company_name=${companyName}`)
      .then((response) => response.data)
      .catch((error) => {
        this.logger.log(`Error while getting clicked form content: ${error}`);
        throw new ServiceUnavailableException();
      });
  }
}
