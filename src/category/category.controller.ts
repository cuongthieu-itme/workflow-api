import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dtos';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard, PaginationQuery } from 'src/common/decorators';
import { IPaginationQuery } from 'src/common/types';

@ApiTags('Categories')
@AuthGuard()
@ApiBearerAuth('JWT-auth')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Create category',
  })
  createCategory(@Body() dto: CreateCategoryDTO) {
    return this.categoryService.createCategory(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
  })
  findAllCategories(@PaginationQuery() { limit, page }: IPaginationQuery) {
    return this.categoryService.findAllCategories(page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
  })
  findCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findCategoryById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update category',
  })
  updateCategoryById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDTO,
  ) {
    return this.categoryService.updateCategoryById(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete category',
  })
  deleteCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.deleteCategoryById(id);
  }
}
