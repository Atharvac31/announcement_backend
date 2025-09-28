/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateAnnouncementDto, UpdateAnnouncementStatusDto } from './dto';
import { AnnouncementService } from './announcement.service';

@Controller('announcement')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post('')
  create(@Body() dto: CreateAnnouncementDto) {
    return this.announcementService.create(dto);
  }

  @Get('')
  findAll(@Headers('if-none-match') etag?: string) {
    const announcements = this.announcementService.findAll().map(a => ({
      ...a,
      commentCount: this.announcementService.getComments(a.id).length,
      reactions: this.announcementService.getReactions(a.id),
    }));

    const newEtag = JSON.stringify(announcements);
    if (etag === newEtag) {
      throw new HttpException('Not Modified', HttpStatus.NOT_MODIFIED);
    }

    return { announcements, etag: newEtag };
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAnnouncementStatusDto) {
    return this.announcementService.updateStatus(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.announcementService.delete(id);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() { authorName, text }: { authorName: string; text: string },
  ) {
    return this.announcementService.addComment(id, authorName, text);
  }

  @Get(':id/comments')
  getComments(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 10,
  ) {
    return this.announcementService.getComments(id, cursor, +limit);
  }

  @Post(':id/reactions')
  addReaction(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Body() { type }: { type: 'up' | 'down' | 'heart' },
  ) {
    this.announcementService.addReaction(id, userId, type);
  }

  @Delete(':id/reactions')
  removeReaction(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    this.announcementService.removeReaction(id, userId);
  }

  @Delete(':id/comments/:commentId')
  removeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    this.announcementService.removeComment(id, commentId);
  }
}
