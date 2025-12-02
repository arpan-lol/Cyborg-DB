import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import prisma from '../../prisma/client';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  SessionDetails,
} from '../../types/chat.types';

export class SearchController {
    static searchSession(): any {
        return 'not implemented!'
    }
}