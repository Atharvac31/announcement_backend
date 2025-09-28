/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import { describe, it, beforeEach, expect, jest } from '@jest/globals';
import { AnnouncementController } from '../announcement/announcement.controller';
import { CreateAnnouncementDto } from '../announcement/dto';
import { BadRequestException } from '@nestjs/common';

describe('AnnouncementController', () => {
  let controller: AnnouncementController;

  // Mock AnnouncementService
  const mockAnnouncementService = {
    create: jest.fn(dto => ({
      id: Math.random().toString(),
      ...dto,
      status: 'active',
      createdAt: new Date(),
    })),
    findAll: jest.fn(() => []),
    updateStatus: jest.fn(),
  };

  beforeEach(() => {
    controller = new AnnouncementController(mockAnnouncementService as any);
  });

  it('should create an announcement', () => {
    const dto: CreateAnnouncementDto = { title: 'Test Title', description: 'Test Desc' };
    const result = controller.create(dto);

    expect(result).toHaveProperty('id');
    expect(result.title).toBe('Test Title');
    expect(result.description).toBe('Test Desc');
    expect(result.status).toBe('active');
    expect(result.createdAt).toBeDefined();
  });

  it('should return all announcements in reverse chronological order', () => {
    const first = controller.create({ title: 'First', description: 'Desc 1' });
    const second = controller.create({ title: 'Second', description: 'Desc 2' });

    const all = controller.findAll();
    expect(all[0].id).toBe(second.id);
    expect(all[1].id).toBe(first.id);
  });

  it('should update status of an announcement', () => {
    const created = controller.create({ title: 'Title', description: 'Desc' });
    const updated = controller.updateStatus(created.id, { status: 'closed' });

    expect(updated.status).toBe('closed');
    expect(controller.findAll()[0].status).toBe('closed');
  });

  it('should throw BadRequestException if invalid status', () => {
    const created = controller.create({ title: 'Title', description: 'Desc' });

    expect(() => controller.updateStatus(created.id, { status: 'invalid' }))
      .toThrow(BadRequestException);
  });

  it('should throw BadRequestException if announcement not found', () => {
    expect(() => controller.updateStatus('non-existent-id', { status: 'active' }))
      .toThrow(BadRequestException);
  });
});
