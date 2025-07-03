import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dtos';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async createCategory(dto: CreateCategoryDTO) {
    const existingCategory = await this.findCategoryByName(dto.name);
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prismaService.category.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAllCategories(page: number, limit: number) {
    const data = await this.prismaService.category.findMany({
      orderBy: { id: 'desc' },
      skip: limit * page,
      take: limit,
    });
    const total = await this.prismaService.category.count();
    return { data, page, limit, total };
  }

  async findCategoryById(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findCategoryByName(name: string) {
    return this.prismaService.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  async updateCategoryById(id: number, dto: UpdateCategoryDTO) {
    await this.findCategoryById(id);

    if (dto.name) {
      const existingCategory = await this.findCategoryByName(dto.name);
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return this.prismaService.category.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCategoryById(id: number) {
    await this.findCategoryById(id);

    return this.prismaService.category.delete({
      where: { id },
    });
  }
}
