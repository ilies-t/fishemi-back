import { NestInterceptor, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { BadRequestException } from '../exception/bad-request.exception';

export const CsvFileInterceptor = (): Type<NestInterceptor> => {
  return FileInterceptor('file', {
    limits: {
      fileSize: 500000, // max: 5 MB
    },

    // verify file type
    fileFilter: async (req, file, callback) => {
      if (!file) {
        callback(
          new BadRequestException("Aucun fichier n'a été transmis"),
          false,
        );
      }
      if (file.mimetype !== 'text/csv') {
        callback(
          new BadRequestException('Le format du fichier doit être un CSV'),
          false,
        );
      }

      // file integrity verification
      const fileExtension = path.extname(file.originalname.toLowerCase());

      if (/^(.csv)$/.test(fileExtension)) {
        callback(null, true);
      } else {
        callback(
          new BadRequestException('Le fichier doit terminer par ".csv"'),
          false,
        );
      }
    },
  });
};
