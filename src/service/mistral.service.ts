import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CampaignGeneratedContentDto } from '@dto/campaign/campaign-generated-content.dto';
import { CompanyRepository } from '@repositories/company.repository';
import globalConfig from '@config/global.config';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { ServiceUnavailableException } from '@exceptions/service-unavailable.exception';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { MistralAiResponseInterface } from '@interfaces/mistral-ai-response.interface';

@Injectable()
export class MistralService {
  private readonly logger = new Logger(MistralService.name);
  public client: AxiosInstance;

  constructor(
    private readonly jwtAccessService: JwtAccessService,
    private readonly companyRepo: CompanyRepository,
  ) {
    this.client = axios.create({
      baseURL: globalConfig().mistralAiBaseUrl,
      headers: {
        Authorization: `Bearer ${globalConfig().mistralAiKey}`,
      },
    });
  }

  public async generateContent(
    headers: Headers,
  ): Promise<CampaignGeneratedContentDto> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const company = await this.companyRepo.findById(jwt.companyId);
    let chatResponse: AxiosResponse<MistralAiResponseInterface>;

    try {
      chatResponse = await this.client.post<MistralAiResponseInterface>(
        '/chat/completions',
        {
          model: 'open-mixtral-8x7b',
          messages: [
            {
              role: 'user',
              content: `
              Génère un mail formel d'a peu près 100 mots (ne mets pas de sujet ni de signature, juste le texte)
              qui invite un employé de l'entreprise "${company.name}" à changer son mot de passe.
              Tu peux utiliser les variables dynamiques suivantes:
              {{employeName}}: Nom de l’employé
              {{boutton}}: Bouton qui redirige sur le formulaire de connexion
              {{employeEmail}}: Adresse mail de l’employé
              `,
            },
          ],
        },
      );
    } catch (error) {
      this.logger.error(`Mistral API failed to generate content`, error);
      throw new ServiceUnavailableException(
        'Ce service est temporairement indisponible, veuillez réessayer plus tard.',
      );
    }

    this.logger.log(
      `Mistral API successfully generate content, response=${chatResponse}`,
    );
    if (chatResponse?.status !== HttpStatus.OK.valueOf()) {
      this.logger.error(
        `Mistral API return unsuccessfully response, response=${chatResponse}`,
      );
      throw new ServiceUnavailableException(
        'Une erreur est survenue, veuillez réessayer plus tard.',
      );
    }

    return new CampaignGeneratedContentDto(chatResponse.data);
  }
}
