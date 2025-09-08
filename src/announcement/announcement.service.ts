/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAnnouncementDto, UpdateAnnouncementStatusDto } from './dto';

interface Announcement {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  status: string;
}

@Injectable()
export class AnnouncementService {
  private announcements: Announcement[] = [];

  create(dto: CreateAnnouncementDto): Announcement {
    const announcement: Announcement = {
      id: Date.now().toString(),
      title: dto.title,
      description: dto.description,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    this.announcements.push(announcement);
    return announcement;
  }

  findAll(): Announcement[] {
    return this.announcements.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  updateStatus(id: string, dto: UpdateAnnouncementStatusDto): Announcement {
    if (!['active', 'closed'].includes(dto.status)) {
      throw new BadRequestException('Invalid status');
    }
    const announcement = this.announcements.find(a => a.id === id);
    if (!announcement) {
      throw new BadRequestException('Announcement not found');
    }
    announcement.status = dto.status;
    return announcement;
  }
}
