import { diskStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';
import {
  MAX_IMAGE_SIZE,
  ValidMimeType,
  validMimeType,
} from 'src/config/file-config';

export const saveImageToStorage: MulterOptions = {
  storage: diskStorage({
    destination: './public/img',
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
