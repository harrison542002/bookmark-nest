import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditedUser } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: number, userDto: EditedUser) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...userDto,
      },
    });

    //remove password in payload
    delete user.hash;
    return user;
  }
}
