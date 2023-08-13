import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditedUser } from '../src/user/dto';
import { BookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    //initialize app
    await app.init();
    await app.listen(3333);
    pactum.request.setBaseUrl('http://localhost:3333');

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(async () => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@gmail.com',
      password: 'password',
    };
    describe('Sign Up', () => {
      it('should throw exception if email is empty', () =>
        pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400));

      it('should throw exception if password is empty', () =>
        pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400));

      it('should throw exception if data in body is empty', () =>
        pactum.spec().post('/auth/signup').expectStatus(400));

      it('should sign up', () =>
        pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201));
    });

    describe('Sign In', () => {
      it('should throw exception if email is empty', () =>
        pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400));

      it('should throw exception if password is empty', () =>
        pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400));

      it('should throw exception if data in body is empty', () =>
        pactum.spec().post('/auth/signin').expectStatus(400));

      it('should sign up', () =>
        pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token'));
    });
  });
  describe('User', () => {
    describe('Get User', () => {
      it('should get current user', () =>
        pactum
          .spec()
          .get('/user/me')
          .withBearerToken('$S{userAt}')
          .expectStatus(200));
    });
    describe('Edit User', () => {
      const editedUserDto: EditedUser = {
        firstName: 'Aung',
        lastName: 'Thiha Htun',
      };
      it('should edited user', () =>
        pactum
          .spec()
          .patch('/user/edit')
          .withBearerToken('$S{userAt}')
          .withBody(editedUserDto)
          .expectStatus(200));
    });
  });
  describe('Bookmark', () => {
    const bookmarkDto: BookmarkDto = {
      title: 'this is a new bookmark',
      description: 'this is the desc of bookmark',
      link: 'www.aung-omega.vercel.app',
    };

    describe('Create Bookmark', () => {
      it('should create a new bookmark', () =>
        pactum
          .spec()
          .post('/bookmark/create')
          .withBearerToken('$S{userAt}')
          .withBody(bookmarkDto)
          .stores('createdBookMark', 'id')
          .expectStatus(201));
    });

    describe('Get Bookmarks', () => {
      it('should get bookmarks for this user', () =>
        pactum
          .spec()
          .get('/bookmark/get')
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectJsonLength(1));
    });

    describe('Get Bookmark with id', () => {
      it('should get bookmark by id', () =>
        pactum
          .spec()
          .get('/bookmark/get/{id}')
          .withPathParams('id', '$S{createdBookMark}')
          .withBearerToken('$S{userAt}')
          .expectStatus(200));
    });

    describe('Edit bookmark', () => {
      it('should edit the bookmark', () =>
        pactum
          .spec()
          .patch('/bookmark/edit/{id}')
          .withPathParams('id', '$S{createdBookMark}')
          .withBody({
            description: 'changes',
          })
          .withBearerToken('$S{userAt}')
          .expectStatus(200));

      it('should throw an exception', () =>
        pactum
          .spec()
          .patch('/bookmark/edit/{id}')
          .withPathParams('id', '$S{createdBookMark}')
          .withBody({
            description: 'changes',
          })
          .withBearerToken('$S{userAt}')
          .expectStatus(200));
    });

    describe('Delete bookmark', () => {
      it('should delete bookmark by id', () =>
        pactum
          .spec()
          .delete('/bookmark/delete/{id}')
          .withPathParams('id', '$S{createdBookMark}')
          .withBearerToken('$S{userAt}')
          .expectStatus(200));
    });
  });
});
