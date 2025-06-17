import axios from 'axios';

console.log('Initializing PermissionServiceClient');

export enum Domain {
  PROJECT = 'PROJECT',
  PROJECT_USER = 'PROJECT_USER',
  TASK = 'TASK',
  SUBSCRIPTION = 'SUBSCRIPTION',
  USER = 'USER'
}

export enum Action {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LIST = 'LIST',
  ACCESS_ALL = 'ACCESS_ALL'
}

export interface PermissionServiceConfig {
  host: string;
  port: number;
}

export interface PermissionResponse {
  allowed: boolean;
}

export class PermissionServiceClient {
  private baseUrl: string;

  constructor(config: PermissionServiceConfig) {
    this.baseUrl = `http://${config.host}:${config.port}`;
  }

  async hasPermission(subjectId: string, domain: Domain, action: Action): Promise<boolean> {
    console.log(`Checking permission for subjectId: ${subjectId}, domain: ${domain}, action: ${action}`);
    try {
      const response = await axios.get<PermissionResponse>(
        `${this.baseUrl}/permissions/check`,
        {
          params: {
            subjectId,
            domain,
            action
          }
        }
      );
      console.log(`Permission response: ${response.data.allowed}`);
      return response.data.allowed;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Permission check failed: ${error.message}`);
      } else {
        console.error(`Unexpected error during permission check: ${error}`);
      }
      console.log('Denying permission due to error');
      return false; // Default to denying permission on error
    }
  }
}