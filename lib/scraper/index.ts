import axios from "axios"
import * as cheerio from 'cheerio'
import { extractPrice,extractCurrency, extractDescription } from "../utils"

export async function scrapeAmazonProduct(url:string){
    if(!url){return}
    
    const username = String(process.env.BRIGHT_DATA_USERNAME)
    const password = String(process.env.BRIGHT_DATA_PASSWORD)
    const port = 22225
    const session_id = (1000000*Math.random()) | 0
    const options = {
        auth:{
            username:`${username}-session-${session_id}`,
            password,
        },
        host:'brd.superproxy.io',
        port,
        rejectUnauthorized:false
    }

    try{
        const res = await axios.get(url,options)
        const $ = cheerio.load(res.data)
        const title = $('#productTitle').text().trim()

        const currentPriceElement = 
        $(`.priceToPay span.a-price-whole,
            .a.size.base.a-color-price,
            .a-button-selected .a-color-base,
            .a-price.aok-align-center span.a-offscreen`);
        const currentPrice = extractPrice(currentPriceElement)

        const initialPriceElement = 
        $(`#priceblock_ourprice,
            #listPrice,
            #priceblock_dealprice,
            .a-price.a-text-price span.a-offscreen,
            .a-price.a-text-price.a-size-base span.a-offscreen`);
        const initialPrice = extractPrice(initialPriceElement);

        const outOfStock = $('#availablity span').text().trim().toLowerCase() === 'currently unavailable'
        const images = $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') || '{}'
        const imageUrls = Object.keys(JSON.parse(images))
        const currency = extractCurrency($('.a-price-symbol'))
        const discountRate = $('#savingsPercentage:first').text().replace(/[^0-9]/g,'');
        const description =  extractDescription($)
        const data = {
            url,
            currency:currency||'$',
            images:imageUrls[0],
            title,
            currentPrice:Number(currentPrice),
            originPrice:Number(initialPrice),
            priceHistory:[],
            discountRate:Number(discountRate),
            category:'category',
            reviewsCount:100,
            stars:4.5,
            isOutOfStock:outOfStock,
            description,
            lowestPrice:Number(currentPrice) || Number(initialPrice),
            highestPrice:Number(initialPrice) || Number(currentPrice),
            average:Number(initialPrice) || Number(currentPrice),
        }
        return data
    }catch(err:any){
        throw new Error(`Failed to scrape product: ${err.message}`)
    }
}