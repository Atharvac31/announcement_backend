/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Patch, Body, Param, BadRequestException } from '@nestjs/common';
import { CreateAnnouncementDto, UpdateAnnouncementStatusDto } from './dto';

interface Announcement {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  status: string;
}

const announcements: Announcement[] = [];

@Controller('announcement')
export class AnnouncementController {
  @Post('')
  create(@Body() dto: CreateAnnouncementDto) {
    const announcement: Announcement = {
      id: Date.now().toString(),
      title: dto.title,
      description: dto.description,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    announcements.push(announcement);
    return announcement;
  }

  @Get('')
  findAll() {
    return announcements.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAnnouncementStatusDto) {
    if (!['active', 'closed'].includes(dto.status)) {
      throw new BadRequestException('Invalid status');
    }
    const announcement = announcements.find(a => a.id === id);
    if (!announcement) {
      throw new BadRequestException('Announcement not found');
    }
    announcement.status = dto.status;
    return announcement;
  }
}
