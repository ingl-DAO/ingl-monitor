import { HttpService } from '@nestjs/axios/dist';
import { Injectable } from '@nestjs/common';

export const REGISTRY_PROGRAMS_API_KEY =
  '';
@Injectable()
export class AppService {
  private readonly headers = {
    'Content-Type': 'application/json',
    'api-key': process.env.REGISTRY_PROGRAMS_API_KEY,
  };
  private readonly requestBody = {
    collection: 'program_list',
    database: 'programs',
    dataSource: 'Cluster0',
    filter: {
      Is_used: false,
    },
  };
  constructor(private readonly httpService: HttpService) {}

  getData(): { message: string } {
    return { message: 'Welcome to Ingl monitor!' };
  }

  async findPrograms() {
    const { data } = await this.httpService.axiosRef.post<{
      documents: {
        _id: string;
        program: string;
        Is_used: boolean;
      }[];
    }>(
      'https://data.mongodb-api.com/app/data-ywjjx/endpoint/data/v1/action/find',
      this.requestBody,
      {
        headers: this.headers,
      }
    );
    return data.documents;
  }

  async findProgramId() {
    const { data } = await this.httpService.axiosRef.post<{
      document?: {
        _id: string;
        program: string;
        Is_used: boolean;
      };
    }>(
      'https://data.mongodb-api.com/app/data-ywjjx/endpoint/data/v1/action/findOne',
      this.requestBody,
      {
        headers: this.headers,
      }
    );
    return data.document?.program;
  }

  async useProgramId(programId: string) {
    await this.httpService.axiosRef.post<{
      document?: {
        _id: string;
        program: string;
        Is_used: boolean;
      };
    }>(
      'https://data.mongodb-api.com/app/data-ywjjx/endpoint/data/v1/action/updateOne',
      {
        ...this.requestBody,
        filter: {
          program: programId,
        },
        update: {
          $set: {
            Is_used: true,
          },
        },
      },
      {
        headers: this.headers,
      }
    );
  }
}
