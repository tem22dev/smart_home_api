import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ResponseMessage } from '@/common';

@Controller('uploads')
export class UploadController {
  @Post('file')
  @ResponseMessage('Upload file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return {
      fileName: file.filename,
    };
  }
}
