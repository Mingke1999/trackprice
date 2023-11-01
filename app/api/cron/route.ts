import { getLowestPrice,getHighestPrice, getAveragePrice,getEmailNotifType } from "@/lib/utils"
import Product from "@/lib/models/product.model"
import { dbConn } from "@/lib/mongoose"
import { scrapeAmazonProduct } from "@/lib/scraper"
import { generateEmail, sendEmail } from "@/lib/nodemailer"
import { NextResponse } from "next/server"

export const maxDuration = 3
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(){
    try{
        dbConn()
        const products = await Product.find({}) //find all products
        if(!products){throw new Error("No Products found")} //no products
        //1. scrape latest product details and update DB
        const updatedProducts = await Promise.all(
            //call multiple async action at same time
            products.map(async (currentProduct)=>{
                const scrapedProduct = await scrapeAmazonProduct(currentProduct.url) 
                if(!scrapedProduct){throw new Error("No product found")}
                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    { price : scrapedProduct.currentPrice }
                ]
                const product = {
                    ...scrapedProduct,
                    priceHistory : updatedPriceHistory,
                    lowestPrice : getLowestPrice(updatedPriceHistory),
                    highestPrice : getHighestPrice(updatedPriceHistory),
                    averagePrice : getAveragePrice(updatedPriceHistory),
                }
                const updatedProduct = await Product.findOneAndUpdate(
                    { url : product.url},
                    product,
                )
                //check each product's status and send email accordingly
                const emailNotifType = getEmailNotifType(scrapedProduct,currentProduct);
  
                if (emailNotifType && updatedProduct.users.length > 0) {
                    const productInfo = {
                    title: updatedProduct.title,
                    url: updatedProduct.url,
                    };
                const emailContent = await generateEmail(productInfo, emailNotifType);
                const userEmails = updatedProduct.users.map((user: any) => user.email);
                await sendEmail(emailContent, userEmails);
            }
            return updatedProduct
        })
     )
     return NextResponse.json({
        message:'Ok',
        data:updatedProducts
     })
    }catch(err){
        throw new Error(`Error in GET:${err}`)
    }
}