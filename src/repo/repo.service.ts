import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepoDto } from './dto/create-repo.dto';
import { CloudinaryService } from 'src/storage/cloudinary/cloudinary.service';

@Injectable()
export class RepoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  async createRepo(
    userId: string,
    { name, description, isPublic }: CreateRepoDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Cannot create repo, user not found');
    }

    const repo = await this.prisma.repo.create({
      data: { name, description, isPublic, user: { connect: { id: userId } } },
      include: { user: false },
    });

    return repo;
  }

  async getAllRepo() {
    const repo = await this.prisma.repo.findMany({});

    if (!repo) {
      throw new HttpException('No Repo Found', HttpStatus.NOT_FOUND);
    }

    return repo;
  }

  async getUserRepo(userId: string) {
    const repo = await this.prisma.repo.findMany({
      where: { user: { id: userId } },
      include: { files: true },
    });

    if (!repo) {
      throw new HttpException(
        'No repo belongs to the user',
        HttpStatus.NOT_FOUND,
      );
    }

    return repo;
  }

  async deleteUserRepo(userId: string, repoId: string) {
    const repo = await this.prisma.repo.findUnique({
      where: { id: repoId, userId },
      include: { files: true },
    });

    if (!repo) {
      throw new NotFoundException(
        'Repository not found or does not belong to the user',
      );
    }

    //For storing file names
    const fileNames: string[] = [];

    repo.files.forEach((file) => fileNames.push(file.publicName));

    //Delete all files from cloudinary, to be implemented
    await this.cloudinary.deleteFiles(fileNames);

    //Delete all file relations to repo and delete repo
    await this.prisma.$transaction([
      this.prisma.repo.update({
        where: { id: userId },
        data: { files: { deleteMany: {} } },
        include: { files: true },
      }),
      this.prisma.repo.delete({ where: { id: repoId } }),
    ]);

    return;
  }
}
