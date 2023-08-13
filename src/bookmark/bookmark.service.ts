import { Injectable, ForbiddenException } from '@nestjs/common';
import { BookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}

  async createBookMark(userId: number, dto: BookmarkDto) {
    const bookmark = await this.prismaService.bookmark.create({
      data: {
        title: dto.title,
        description: dto.description,
        userId: userId,
        link: dto.link,
      },
    });
    return bookmark;
  }

  async getBookmarks(userId: number) {
    const bookmarks = await this.prismaService.bookmark.findMany({
      where: {
        userId: userId,
      },
    });
    return bookmarks;
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
        userId: userId,
      },
    });

    if (!bookmark)
      throw new ForbiddenException('Request Bookmark does not exist.');

    return bookmark;
  }

  async editBookmarkById(userId: number, bookMarkId: number, dto: BookmarkDto) {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: { id: bookMarkId },
    });

    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access Resource Denied.');

    const editBookMark = await this.prismaService.bookmark.update({
      where: {
        userId: userId,
        id: bookMarkId,
      },
      data: {
        ...dto,
      },
    });
    return editBookMark;
  }

  async deleteBookmarkById(userId: number, bookMarkId: number) {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: { id: bookMarkId },
    });

    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access Resource Denied.');

    const deleteBookMark = await this.prismaService.bookmark.delete({
      where: {
        userId: userId,
        id: bookMarkId,
      },
    });

    return deleteBookMark;
  }
}
