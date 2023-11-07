"use server"
import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { dbConn } from "../mongoose";
import { scrapeJBHIFIProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmail, sendEmail } from "../nodemailer";

export async function scrapAndStoreProducts(productUrl:string){
    if(!productUrl){
        return
    }
    try{
        dbConn()
        const scrapedProduct = await scrapeJBHIFIProduct(productUrl);
        console.log(scrapedProduct)
        // if(!scrapedProduct) return
        // let product = scrapedProduct
        // const existingProduct = await Product.findOne({
        //     url : scrapedProduct.url
        // })
        // if(existingProduct){
        //     const updatedPriceHistory : any = [
        //         ...existingProduct.priceHistory,
        //         { price : scrapedProduct.currentPrice }
        //     ]
        //     product = {
        //         ...scrapedProduct,
        //         priceHistory : updatedPriceHistory,
        //         lowestPrice : getLowestPrice(updatedPriceHistory),
        //         highestPrice : getHighestPrice(updatedPriceHistory),
        //         averagePrice : getAveragePrice(updatedPriceHistory),
        //     }
        // }
        // //inserting new product
        // const newProduct = await Product.findOneAndUpdate(
        //     { url : scrapedProduct.url},
        //     product,
        //     { upsert: true, new :true},
        // )
        // revalidatePath(`/products/${newProduct._id}`)
    }catch(err:any){
        throw new Error(`Failed to create/update product: ${err.message}`)
    }
}
export async function getProductById(productId:string){
    try{
        dbConn()
        const product = await Product.findOne({_id:productId})
        if(!product){
            return null
        }
        return product
    }catch(err){
        console.log(err)
    }
}
export async function getAll(){
    try{
        dbConn()
        const products = await Product.find()

        return products
    }catch(err){
        console.log(err)
    }
}
export async function getSimilars(productId:string){
    try{
        dbConn()
        const currentProduct = await Product.findById(productId)

        if(!currentProduct) return null
        const similaries = await Product.find({
            _id:{$ne : productId},
        }).limit(3)
        return similaries
    }catch(err){
        console.log(err)
    }
}

export async function addUserEmailToProduct(productId:string, email:string){
    try{
        const product = await Product.findById(productId)
        if(!product) return
        const userExists = product.users.some((user:User)=>user.email === email)
        if(!userExists){
            product.users.push({email:email})
            await product.save()

            const emailContent = await generateEmail(product, "WELCOME")
            await sendEmail(emailContent,[email])
        }
    }catch(err){
        console.log(err)
    }
}