/* eslint-disable prettier/prettier */
import { describe, beforeEach, it, expect } from '@jest/globals';
import { AnnouncementService } from '../announcement/announcement.service';
import { BadRequestException } from '@nestjs/common';

describe('AnnouncementService', () => {
  let service: AnnouncementService;

  beforeEach(() => {
    service = new AnnouncementService();
  });

  it('should return empty array initially', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('should create an announcement', () => {
    const dto = { title: 'Test Title', description: 'Test Desc' };
    const result = service.create(dto);

    expect(result).toHaveProperty('id');
    expect(result.title).toBe('Test Title');
    expect(result.description).toBe('Test Desc');
    expect(result.status).toBe('active');
    expect(result.createdAt).toBeDefined();
  });

  it('should return announcements in reverse chronological order', () => {
    const first = service.create({ title: 'First', description: 'Desc 1' });
    const second = service.create({ title: 'Second', description: 'Desc 2' });

    const all = service.findAll();
    expect(all[0].id).toBe(second.id);
    expect(all[1].id).toBe(first.id);
  });

  it('should update status to active', () => {
    const created = service.create({ title: 'Title', description: 'Desc' });
    const updated = service.updateStatus(created.id, { status: 'active' });

    expect(updated.status).toBe('active');
    expect(service.findAll()[0].status).toBe('active');
  });

  it('should update status to closed', () => {
    const created = service.create({ title: 'Title', description: 'Desc' });
    const updated = service.updateStatus(created.id, { status: 'closed' });

    expect(updated.status).toBe('closed');
    expect(service.findAll()[0].status).toBe('closed');
  });

  it('should throw BadRequestException for invalid status', () => {
    const created = service.create({ title: 'Title', description: 'Desc' });

    expect(() => service.updateStatus(created.id, { status: 'invalid' }))
      .toThrow(BadRequestException);
  });

  it('should throw BadRequestException when announcement id not found', () => {
    expect(() => service.updateStatus('non-existent-id', { status: 'active' }))
      .toThrow(BadRequestException);
  });

  it('should throw BadRequestException when announcements list is empty on update', () => {
    expect(() => service.updateStatus('any-id', { status: 'active' }))
      .toThrow(BadRequestException);
  });
});
/* Use the global expect from the test environment */
function expect(arg0: () => Announcement) {
  throw new Error('Function not implemented.');
}
/* Removed custom expect function to use the global test assertion library */

