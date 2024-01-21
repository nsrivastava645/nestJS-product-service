import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
} from './product.dto';
import { Product } from './product.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    try {
      return await this.productService.createProduct(createProductDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async getProducts(): Promise<{ totalRecords: number; products: Product[] }> {
    return await this.productService.getProducts();
  }

  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<Product> {
    console.log('here');
    const product = await this.productService.getProductById(id);
    console.log(product);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'user')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const updatedProduct = await this.productService.updateProduct(
        id,
        updateProductDto,
      );
      if (!updatedProduct) {
        throw new NotFoundException('Product not found');
      }
      return updatedProduct;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async deleteProduct(@Param('id') id: string): Promise<void> {
    const result = await this.productService.deleteProduct(id);
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'user')
  async decreaseProductStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<Product> {
    try {
      const updatedProduct = await this.productService.updateStock(
        id,
        updateStockDto,
      );
      if (!updatedProduct) {
        throw new NotFoundException('Product not found');
      }
      return updatedProduct;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }
}
