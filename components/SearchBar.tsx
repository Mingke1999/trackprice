"use client"
import { scrapAndStoreProducts } from "@/lib/actions"
import { scrapeAmazonProduct } from "@/lib/scraper"
import { FormEvent, useState } from "react"

const validateURL = (url:string) =>{
    try
    {
        const parsedURL = new URL(url)
        const hostname = parsedURL.hostname
        if(
            hostname.includes('amazon.com')||
            hostname.includes('amazon.')||
            hostname.endsWith('amazon')
        ){
            return true
        }
    }
    catch(err)
    {
        return false
    }
    return false
}
const SearchBar = () => {
  const [searchPrompt, setSearchPrompt] = useState("")
  const [isloading, setIsLoading] = useState(false)

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault() //store reload
    const isValidLink = validateURL(searchPrompt)
    if(!isValidLink){
        return alert('please provide a valid link')
    }
    try{
        setIsLoading(true)
        const product = await scrapAndStoreProducts(searchPrompt)
    }catch(err){
        console.log(err)
    }finally{
        setIsLoading(false)
    }
  }
  return (
    <form 
        className='flex flex-warp gap-4 mt-12'
        onSubmit={handleSubmit}    
    >
        <input
            type="text"
            value={searchPrompt}
            onChange={(e)=>setSearchPrompt(e.target.value)}
            placeholder="Paster Your Link Here"
            className="searchbar-input"
        />
        <button 
            type="submit" 
            className="searchbar-btn"
            disabled={searchPrompt===''}
        >
        {isloading ? 'Searching...':'Search'}
        </button>
    </form>
  )
}

export default SearchBar