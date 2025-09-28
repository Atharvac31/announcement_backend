/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAnnouncementDto, UpdateAnnouncementStatusDto } from './dto';

export interface Announcement {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  status: string;
  commentCount?: number;
  reactions?: Record<string, number>;
  lastActivityAt?: string;
}

export interface Reaction {
  type: 'up' | 'down' | 'heart';
  userId: string;
}

export interface Comment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

@Injectable()
export class AnnouncementService {
  delete(id: string) {
    throw new Error('Method not implemented.');
  }
  private announcements: Announcement[] = [];
  private comments: Record<string, Comment[]> = {};
  private reactions: Record<string, Reaction[]> = {};

  create(dto: CreateAnnouncementDto): Announcement {
    const announcement: Announcement = {
      id: Date.now().toString(),
      title: dto.title,
      description: dto.description,
      createdAt: new Date().toISOString(),
      status: 'active',
      lastActivityAt: new Date().toISOString(), // Set lastActivityAt on creation
    };
    this.announcements.push(announcement);
    return announcement;
  }

  findAll(): Announcement[] {
    return this.announcements.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // Ensure announcements are sorted
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

  addComment(announcementId: string, authorName: string, text: string): Comment {
    const comment: Comment = {
      id: Date.now().toString(),
      authorName,
      text,
      createdAt: new Date().toISOString(),
    };
    this.comments[announcementId] = this.comments[announcementId] || [];
    this.comments[announcementId].push(comment);

    const announcement = this.announcements.find(a => a.id === announcementId);
    if (announcement) {
      announcement.commentCount = (announcement.commentCount || 0) + 1;
      announcement.lastActivityAt = comment.createdAt;
    }
    return comment;
  }

removeComment(announcementId: string, commentId: string): void {
    const comments = this.comments[announcementId];

    // Check if there are any comments for this announcement
    if (!comments) {
      throw new BadRequestException('Announcement has no comments or does not exist.');
    }

    const initialCommentCount = comments.length;
    
    // Use filter to create a new array without the specified comment
    const updatedComments = comments.filter(c => c.id !== commentId);

    // If the length is the same, the comment was not found
    if (updatedComments.length === initialCommentCount) {
      throw new BadRequestException('Comment not found');
    }

    // Assign the new, filtered array back
    this.comments[announcementId] = updatedComments;

    const announcement = this.announcements.find(a => a.id === announcementId);
    if (announcement) {
      // Update the comment count and last activity timestamp
      announcement.commentCount = updatedComments.length;
      announcement.lastActivityAt = new Date().toISOString();
    }
  }

  getComments(announcementId: string, cursor?: string, limit = 10): Comment[] {
    const allComments = this.comments[announcementId] || [];
    const startIndex = cursor ? allComments.findIndex(c => c.id === cursor) + 1 : 0;
    return allComments.slice(startIndex, startIndex + limit);
  }

 addReaction(announcementId: string, userId: string, type: 'up' | 'down' | 'heart'): void {
    // Ensure the reactions array exists for this announcement
    if (!this.reactions[announcementId]) {
      this.reactions[announcementId] = [];
    }

    const reactions = this.reactions[announcementId];
    const existingReactionIndex = reactions.findIndex(r => r.userId === userId);

    if (existingReactionIndex > -1) {
      // User has already reacted.
      if (reactions[existingReactionIndex].type === type) {
        // Case 1: Clicking the same button again removes the reaction (toggle off).
        reactions.splice(existingReactionIndex, 1);
      } else {
        // Case 2: Clicking a different button changes the reaction type.
        reactions[existingReactionIndex].type = type;
      }
    } else {
      // Case 3: User has not reacted yet, so add a new reaction (toggle on).
      reactions.push({ userId, type });
    }
    
    // Update the last activity timestamp
    const announcement = this.announcements.find(a => a.id === announcementId);
    if (announcement) {
      announcement.lastActivityAt = new Date().toISOString();
    }
  }

  removeReaction(announcementId: string, userId: string): void {
    const reactions = this.reactions[announcementId] || [];
    this.reactions[announcementId] = reactions.filter(r => r.userId !== userId);
  }

  getReactions(announcementId: string): Record<string, number> {
    const reactions = this.reactions[announcementId] || [];
    return reactions.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

