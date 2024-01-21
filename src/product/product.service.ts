import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './product.model';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
} from './product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = new this.productModel(createProductDto);
    return await newProduct.save();
  }

  async getProducts(): Promise<{ totalRecords: number; products: Product[] }> {
    const [totalRecords, products] = await Promise.all([
      this.productModel.countDocuments(),
      this.productModel.find(),
    ]);
    return {
      totalRecords,
      products,
    };
  }

  async getProductById(id: string): Promise<Product> {
    return await this.productModel.findById(id).exec();
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true },
    );
    return updatedProduct;
  }

  async updateStock(
    id: string,
    updateStockDto: UpdateStockDto,
  ): Promise<Product> {
    const session = await this.productModel.startSession();
    session.startTransaction();

    try {
      const productId = new Types.ObjectId(id);
      const product = await this.productModel
        .findById(productId)
        .session(session)
        .exec();

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (
        updateStockDto.quantity < 0 &&
        product.stock >= Math.abs(updateStockDto.quantity)
      ) {
        // Decrease stock case
        const updatedProduct = await this.productModel
          .findByIdAndUpdate(
            productId,
            { $inc: { stock: updateStockDto.quantity } },
            { new: true, session },
          )
          .exec();

        await session.commitTransaction();
        session.endSession();

        return updatedProduct;
      } else {
        throw new Error('Not enough stock to decrease');
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
