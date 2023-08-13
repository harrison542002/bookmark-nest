import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(userdto: AuthDto) {
    //find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: userdto.email,
      },
    });

    //if user does not exist throw exception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    //compare password
    const pwMatch = await argon.verify(user.hash, userdto.password);

    //if password correct throw exception
    if (!pwMatch) {
      throw new ForbiddenException('Credentials incorrect');
    }

    return await this.signToken(user.id, user.email);
  }

  async signup(userdto: AuthDto) {
    //hash the password
    const hash = await argon.hash(userdto.password);

    try {
      //save the user with hashed pwd
      const user = await this.prisma.user.create({
        data: {
          email: userdto.email,
          hash,
        },
      });

      //return the new created user
      return await this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credential taken');
        }
      }
      throw error();
    }
  }

  async signToken(
    userId: number,
    userEmail: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      // a unique identifier for a data
      sub: userId,
      userEmail,
    };

    const generatedToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET'),
    });
    return {
      access_token: generatedToken,
    };
  }
}
