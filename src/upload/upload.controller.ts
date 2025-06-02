import { Controller, Post, UseInterceptors, UploadedFile, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ResponseMessage } from '@/common';

@Controller('uploads')
export class UploadController {
  @Post('file')
  @ResponseMessage('Upload file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Headers('folder-type') folder: string) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const fileUrl = `${folder || 'uploads'}/${file.filename}`;
    return {
      fileName: fileUrl,
    };
  }
}
