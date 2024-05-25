import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RepoService } from './repo.service';
import { CreateRepoDto } from './dto/create-repo.dto';
import { plainToInstance } from 'class-transformer';
import { RepoResponseDto } from './dto/repo-response.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guards';
import {
  bookmarkRepoIdsResponseDto,
  bookmarkResponseDto,
} from './dto/bookmark-response.dto';

@ApiTags('Repository')
@UseGuards(AuthGuard)
@Controller({ path: 'users', version: '1' })
export class RepoController {
  constructor(private readonly repoService: RepoService) { }
  @ApiOperation({ summary: 'Create a new repository for a user' })
  @ApiResponse({
    status: 201,
    description: 'Returns created repo',
    type: RepoResponseDto,
  })
  @ApiBody({
    type: CreateRepoDto,
    description: 'Json structure for repo object',
  })
  @Post(':userId/repo')
  async CreateRepo(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: CreateRepoDto,
  ): Promise<RepoResponseDto> {
    const response = await this.repoService.createRepo(userId, body);

    return plainToInstance(RepoResponseDto, response);
  }

  @ApiOperation({ summary: 'Fetch all repositories' })
  @ApiResponse({
    status: 200,
    description: 'Fetches All Repos',
    type: RepoResponseDto,
    isArray: true,
  })
  @Get('repo')
  async getAllRepo(): Promise<RepoResponseDto[]> {
    const response = await this.repoService.getAllRepo();

    return plainToInstance(RepoResponseDto, response);
  }

  @ApiOperation({ summary: 'Fetch repositories of a specific user' })
  @ApiResponse({
    status: 200,
    description: "Fetches a user's repos",
    type: RepoResponseDto,
    isArray: true,
  })
  @Get(':userId/repo')
  async getUserRepo(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<RepoResponseDto[]> {
    const response = await this.repoService.getUserRepo(userId);

    return plainToInstance(RepoResponseDto, response);
  }

  @ApiOperation({ summary: 'Bookmark a repository of a user' })
  @ApiResponse({
    status: 201,
    description: "Fetches a user's bookmark record",
  })
  @Post(':userId/repo/:repoId/bookmark')
  async bookmarkRepo(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('repoId', ParseUUIDPipe) repoId: string,
  ): Promise<bookmarkResponseDto> {
    const response = await this.repoService.bookmarkRepo(userId, repoId);

    return plainToInstance(bookmarkResponseDto, response);
  }

  @ApiOperation({ summary: 'Unbookmark a repository of a user' })
  @ApiResponse({
    status: 204,
    description: 'Deletes the bookmark record',
    type: RepoResponseDto,
  })
  @HttpCode(204)
  @Delete(':userId/repo/:repoId/bookmark')
  async unbookmarkRepo(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('repoId', ParseUUIDPipe) repoId: string,
  ): Promise<RepoResponseDto> {
    await this.repoService.unbookmarkRepo(userId, repoId);

    return;
  }

  @ApiOperation({ summary: 'Delete a repository of a user' })
  @ApiResponse({
    status: 204,
    description: "Deletes a user's repo",
  })
  @HttpCode(204)
  @Delete(':userId/repo/:repoId')
  async deleteUserRepo(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('repoId', ParseUUIDPipe) repoId: string,
  ) {
    return await this.repoService.deleteUserRepo(userId, repoId);
  }
}
