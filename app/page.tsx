import React from 'react'
import Image from 'next/image'
import SearchBar from '@/components/SearchBar'
import HeroCarousel from '@/components/HeroCarousel'
import { getAll } from '@/lib/actions'
import ProductCard from '@/components/ProductCard'

const Page = async () => {
  const allProducts = await getAll()

  return (
    <>
      <section className='px-6 md:px-20 py-24'>
        <div className='flex max-xl:flex-col gap-16'>
          <div className='flex flex-col justify-center'>
            <p className='small-text'>
              Always Make sure Lowest Price:
              <Image
                src="/assets/icons/arrow-right.svg"
                alt='arrow-right'
                width={16}
                height={16}
              />
            </p>
            <h1 className='head-text'>
              Upgrade Your Shopping with
              <span className='text-primary'>
              &nbsp;PriceHuntOnline
              </span>
            </h1>
            <p className='mt-6'>
              Unlock the full potential of our website, 
              designed for seamless functionality that allows you to effortlessly track and compare prices for a wide variety of products, 
              ensuring a smarter and more efficient online shopping experience.
            </p>
            <SearchBar/>
          </div>
          <HeroCarousel/>
        </div>
      </section>
      <section className='trending-section'>
        <h2 className='section-text'>Trending</h2>
        <div className='flex flex-warp gap-x-8 gap-y-16'>
          {
            allProducts?.map((product)=>(
              <ProductCard key={product._id} product={product}/>
            ))
          }
        </div>
      </section>
    </>
  )
}

export default Page