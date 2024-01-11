import { diskStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';
import {
  AVATAR_PATH,
  MAX_IMAGE_SIZE,
  POST_PATH,
  ValidMimeType,
  validMimeType,
} from 'src/config/file-config';

export const saveAvatarToStorage: MulterOptions = {
  storage: diskStorage({
    destination: `./public${AVATAR_PATH}`,
    filename: (req, file, cb) => {
      const randomNumber = Math.floor(Math.random() * 900000) + 100000;
      const fileName: string =
        Date.now() + '-' + randomNumber + '-' + file.originalname;
      cb(null, fileName);
    },
  }),
  fileFilter(req, file, cb) {
    validMimeType.includes(file.mimetype as ValidMimeType)
      ? cb(null, true)
      : cb(new BadRequestException('file must be a png, jpg, jpeg'), false);
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE * 1024 * 1024,
  },
};

export const saveCoverPostToStorage: MulterOptions = {
  storage: diskStorage({
    destination: `./public${POST_PATH}`,
    filename: (req, file, cb) => {
      const randomNumber = Math.floor(Math.random() * 900000) + 100000;
      const fileName: string =
        Date.now() + '-' + randomNumber + '-' + file.originalname;
      cb(null, fileName);
    },
  }),
  fileFilter(req, file, cb) {
    validMimeType.includes(file.mimetype as ValidMimeType)
      ? cb(null, true)
      : cb(new BadRequestException('file must be a png, jpg, jpeg'), false);
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE * 1024 * 1024,
  },
};
