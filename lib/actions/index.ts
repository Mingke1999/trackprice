"use server"
import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { dbConn } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scrapAndStoreProducts(productUrl:string){
    if(!productUrl){
        return
    }
    try{
        dbConn()
        const scrapedProduct = await scrapeAmazonProduct(productUrl);
        if(!scrapedProduct) return
        let product = scrapedProduct
        const existingProduct = await Product.findOne({
            url : scrapedProduct.url
        })
        if(existingProduct){
            const updatedPriceHistory : any = [
                ...existingProduct.priceHistory,
                { price : scrapedProduct.currentPrice }
            ]
            product = {
                ...scrapedProduct,
                priceHistory : updatedPriceHistory,
                lowestPrice : getLowestPrice(updatedPriceHistory),
                highestPrice : getHighestPrice(updatedPriceHistory),
                averagePrice : getAveragePrice(updatedPriceHistory),
            }
        }
        //inserting new product
        const newProduct = await Product.findOneAndUpdate(
            { url : scrapedProduct.url},
            product,
            { upsert: true, new :true},
        )
        revalidatePath(`/products/${newProduct._id}`)
    }catch(err:any){
        throw new Error(`Failed to create/update product: ${err.message}`)
    }
}