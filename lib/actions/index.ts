"use server"

import { scrapeAmazonProduct } from "../scraper";

export async function scrapAndStoreProducts(productUrl:string){
    if(!productUrl){
        return
    }
    try{
        const scrapdProduct = await scrapeAmazonProduct(productUrl);
        if(!scrapdProduct) return;
        
    }catch(err:any){
        throw new Error(`Failed to create/update product: ${err.message}`)
    }
}