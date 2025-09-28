/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementController } from '../src/announcement/announcement.controller';
import { AnnouncementService } from '../src/announcement/announcement.service';
import { BadRequestException } from '@nestjs/common';

describe('AnnouncementController', () => {
  let controller: AnnouncementController;
  let service: AnnouncementService;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(dto => ({ id: '1', ...dto, status: 'active', createdAt: new Date().toISOString() })),
      findAll: jest.fn(() => [{ id: '1', title: 'Test', description: 'Desc', status: 'active', createdAt: new Date().toISOString() }]),
      updateStatus: jest.fn((id, dto) => ({ id, status: dto.status })),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementController],
      providers: [{ provide: AnnouncementService, useValue: mockService }],
    }).compile();

    controller = module.get<AnnouncementController>(AnnouncementController);
    service = module.get<AnnouncementService>(AnnouncementService);
  });

  it('should create an announcement', () => {
    const dto = { title: 'New Title', description: 'New Desc' };
    const result = controller.create(dto);

    expect(result).toHaveProperty('id');
    expect(result.title).toBe('New Title');
    expect(result.description).toBe('New Desc');
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should get all announcements', () => {
    const result = controller.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should update announcement status', () => {
    const result = controller.updateStatus('1', { status: 'closed' });

    expect(result).toEqual({ id: '1', status: 'closed' });
    expect(service.updateStatus).toHaveBeenCalledWith('1', { status: 'closed' });
  });

  it('should throw BadRequestException on invalid status update', () => {
    jest.spyOn(service, 'updateStatus').mockImplementation(() => { throw new BadRequestException('Invalid status'); });

    expect(() => controller.updateStatus('1', { status: 'invalid' }))
      .toThrow(BadRequestException);
  });
  it('should return empty array initially', () => {
  const all = service.findAll();
  expect(all).toEqual([]);
});

it('should throw BadRequestException if updateStatus called before any announcement exists', () => {
  expect(() => service.updateStatus('1', { status: 'active' }))
    .toThrow(BadRequestException);
});

it('should keep announcements in sorted order after multiple creates', () => {
  service.create({ title: 'A', description: 'Desc A' });
  service.create({ title: 'B', description: 'Desc B' });

  const all = service.findAll();
  expect(all[0].title).toBe('B');  // Newer created comes first
  expect(all[1].title).toBe('A');
});
it('should throw BadRequestException when updateStatus fails', () => {
  jest.spyOn(service, 'updateStatus').mockImplementation(() => { throw new BadRequestException('Invalid'); });

  expect(() => controller.updateStatus('1', { status: 'invalid' }))
    .toThrow(BadRequestException);
});

});
