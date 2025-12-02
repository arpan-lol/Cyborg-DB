import { SessionController } from './session.controllers';
import { MessageController } from './message.controllers';
import { AttachmentController } from './attachment.controllers';
import { SearchController } from './search.controllers';

export const ChatController = {
  // Session methods
  createSession: SessionController.createSession,
  getSessions: SessionController.getSessions,
  getSessionById: SessionController.getSessionById,
  deleteSession: SessionController.deleteSession,

  // Message methods
  sendMessage: MessageController.sendMessage,
  streamResponse: MessageController.streamResponse,

  // Attachment methods
  uploadFile: AttachmentController.uploadFile,
  getAttachmentStatus: AttachmentController.getAttachmentStatus,
  streamAttachmentStatus: AttachmentController.streamAttachmentStatus,

  // Search methods
  searchSession: SearchController.searchSession,
};

export { SessionController } from './session.controllers';
export { MessageController } from './message.controllers';
export { AttachmentController } from './attachment.controllers';
export { SearchController } from './search.controllers';