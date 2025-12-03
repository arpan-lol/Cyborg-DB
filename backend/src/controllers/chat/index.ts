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
  message: MessageController.message,

  // Attachment methods
  uploadFile: AttachmentController.uploadFile,
  getSessionAttachments: AttachmentController.getSessionAttachments,
  getAttachmentStatus: AttachmentController.getAttachmentStatus,
  streamAttachmentStatus: AttachmentController.streamAttachmentStatus,
  deleteAttachment: AttachmentController.deleteAttachment,

  // Search methods
  searchSession: SearchController.searchSession,
};

export { SessionController } from './session.controllers';
export { MessageController } from './message.controllers';
export { AttachmentController } from './attachment.controllers';
export { SearchController } from './search.controllers';