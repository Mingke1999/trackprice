import mongoose from 'mongoose'

let connnected = false
export const dbConn = async () =>{
    mongoose.set('strictQuery',true) //prevent unknown field
    if(!process.env.MONGODB_URI){
        console.log('MONGODB_URL is not defined')
    }
    if(connnected){
        console.log('connection existing')
    }
    try{
        if (typeof process.env.MONGODB_URI === 'string') {
            await mongoose.connect(process.env.MONGODB_URI)
            connnected = true
            console.log('Database Connected')
        }
    }catch(err){
        console.error('Database connection error:', err);
    }
}
