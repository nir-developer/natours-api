//FINALLY : CLI: 
//node dev-data/data/import-dev-data.js --delete

const dotenv = require('dotenv') 
dotenv.config({path: './config.env'})
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
//ALWAYS RELATIVE TO THE ROOT FOLDER OF THE PROJECT!
const Tour = require('../../models/Tour')
const tourRouter = require('../../routes/tourRoutes')


//STEP 1: CONNECT TO DB
//const DB = process.env.DB_ATLAS
const DB = process.env.DB_COMPASS
console.log(DB)
// CONNECT TO DB  - TOP LEVEL!
mongoose
.connect(DB) 
.then(() => console.log(`DB connection successful!`))
.catch(err => console.log(err.message))


  
   

    const importData = async(tours) =>{
        try 
        {
            await Tour.create(tours)
            console.log('DEV DATA TOURS STORED IN DB!!');
        }
        catch(err)
        {
            console.log(err)
        }

         //HARD TERMINATION - THAT FINE SINCE I RUN ONLY THIS SCRIPT - NOT THE APP..
         process.exit();
    }


//DELETE ALL TOUR DOCUMENTS FROM THE TOURS COLLECTION IN DB
const deleteData =async () => {
    try 
    {
        //LIKE IN MONGODB - MONGOOSE HAS THIS FUNCTION TO DELETE ALL DOCUMENTS! - deleteMany(with no param) 
        await Tour.deleteMany(); 
        console.log(`ALL TOURS DELETED FROM THE TOURS COLLECTION IN DB: `)
    }
    catch(err)
    {
        console.log(err.message)
    }
        //HARD TERMINATION - THAT FINE SINCE I RUN ONLY THIS SCRIPT - NOT THE APP..
         process.exit();
}
 



//READ TOURS OBJECT FROM THE JSON FILE - SYNC!
//  const tours = JSON.parse(fs.readFileSync(path.join(__dirname, 'tours-simple.json'), 'utf-8'))

//Tours with embedded locations!
 const tours = JSON.parse(fs.readFileSync(path.join(__dirname, 'tours.json'), 'utf-8'))



 //CHECK COMMAND LINE THIRD ARG 
if(process.argv[2] === '--import') importData(tours) 

else if(process.argv[2] === '--delete') deleteData(); 




//OK
//deleteData();
//importData(tours); 



