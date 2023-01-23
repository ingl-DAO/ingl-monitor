import { HttpService } from '@nestjs/axios/dist';
import { Injectable } from '@nestjs/common';

export const REGISTRY_PROGRAMS_API_KEY =
  'G0Xk2aLhmwfIKlFgiwPkaOtIOy3hHURe1hvuC4pMlGUloSptWWwTRgOP4KkZtRyO';
@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  getData(): { message: string } {
    return { message: 'Welcome to Ingl monitor!' };
  }

  async getProgramId() {
    const { data } = await this.httpService.axiosRef.post<{
      document?: {
        _id: string;
        program: string;
        Is_used: boolean;
      };
    }>(
      'https://data.mongodb-api.com/app/data-ywjjx/endpoint/data/v1/action/findOne',
      {
        collection: 'program_list',
        database: 'programs',
        dataSource: 'Cluster0',
        filter: {
          Is_used: false,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': REGISTRY_PROGRAMS_API_KEY,
        },
      }
    );
    return data.document?.program;
  }

  async updateProgram(programId: string) {
    await this.httpService.axiosRef.post<{
      document?: {
        _id: string;
        program: string;
        Is_used: boolean;
      };
    }>(
      'https://data.mongodb-api.com/app/data-ywjjx/endpoint/data/v1/action/updateOne',
      {
        collection: 'program_list',
        database: 'programs',
        dataSource: 'Cluster0',
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
        headers: {
          'Content-Type': 'application/json',
          'api-key': REGISTRY_PROGRAMS_API_KEY,
        },
      }
    );
  }
}
