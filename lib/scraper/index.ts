import puppeteer from "puppeteer"
import { SearchImageUrl } from "../utils";

export async function scrapeJBHIFIProduct(url:string){
    if(!url){return}
    //intialise headless puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try{
        //open url
        await page.goto(url);
        const pageContent = await page.content();

        //wait for specific className element rendered
        await page.waitForSelector('div._12mtftw0._12mtftw8 h1');
        await page.waitForSelector('.PriceTag_actualWrapperDefault__1eb7mu9p');
        await page.waitForSelector('div._6zw1gn9._6zw1gn8')
        await page.waitForSelector('div._6zw1gn8')
        await page.waitForSelector('.PriceTag_footerPriceWrapper__1eb7mu9l')
        
        //grabing info for each
        const image = SearchImageUrl(pageContent)
        const data = await page.evaluate((url, image)=>{
            const title = document.querySelector('div._12mtftw0._12mtftw8 h1')?.textContent;
            let currentPrice, initialPrice
            const currentPriceText = document.querySelector('.PriceTag_actualWrapperDefault__1eb7mu9p')?.textContent
            if (currentPriceText) {
                const matches = currentPriceText.match(/\d+/);
                if (matches) {
                    currentPrice = matches[0];
                }
            }
            const priceSpanElement = document.querySelector('.PriceTag_priceHeader__1eb7mu91a');
            if (priceSpanElement) {
                // Within the parent span, select the span containing the price
                const priceValueElement = priceSpanElement.querySelector('span:not(.PriceTag_symbolHeader__1eb7mu91b)');
            
                if (priceValueElement) {
                    initialPrice = priceValueElement.textContent;
                    
                }
            }
            const currency = document.querySelector('.PriceTag_symbolBase__1eb7mu9u')?.textContent
            const stars = document.querySelector('div._6zw1gn8')?.textContent
            //review count not done yet
            let reviewsCount
            const reviewsCountText = document.querySelector('div._6zw1gn9._6zw1gn8')?.textContent
            if (reviewsCountText) {
                const matches = reviewsCountText.match(/\((\d+)\)/);
                if (matches) {
                    reviewsCount = matches[1];
                }
            }
            const imgSrc = image
            const httpsUrl = "https:" + imgSrc
            let discountRate 
            let outOfStock
            let description

            return{
                url,
                currency:currency||'$',
                title,
                currentPrice:Number(currentPrice),
                originPrice:Number(initialPrice),
                priceHistory:[],
                stars,
                description,
                lowestPrice:Number(currentPrice) || Number(initialPrice),
                highestPrice:Number(initialPrice) || Number(currentPrice),
                averagePrice:Number(initialPrice) || Number(currentPrice),
                reviewsCount:Number(reviewsCount),
                category:'category',
                image: httpsUrl,
                discountRate:Number(discountRate) || 0,
                isOutOfStock:outOfStock || false,
                }
            },url, image);
        return data
    }catch(err:any){
        throw new Error(`Failed to scrape product: ${err.message}`)
    }finally {
        await browser.close();
    }
}