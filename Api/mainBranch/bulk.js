const Router = require("express").Router();
const { Bulk, BulkStages} = require("../../Modal");
const { NEW_BULK } = require( "./bulkStages" );
const calculatioClass  = require("../businessLogic/costCalculation");


Router.post ( "/on-stages-bulks-list", ( req, res )=>{
    const { stage_id }   = req.body;
    Bulk.find({ processStage: stage_id })
    .then( async foundBulks => {
        if( foundBulks.length > 0 ){
            return res.json ({ msg: "New Bulks LIST!",Bulks: foundBulks,  success: true }).status( 200);
        }else{
            let bulkStage =  await BulkStages.findOne({ _id: stage_id });
            return res.json ({ msg: `NO ${bulkStage.name}!`, success: false }).status( 404 );
        }
    } ) 
    .catch( err=> {
        console.log  ( err );
        return res.json ({ msg: "Failed!" , success:false}).status( 400 );
    } )
} )





Router.post( "/add_bulk_stage", ( req, res ) =>{
    const { processName, level }  = req.body ;
    if( processName === "" || level === "" ){
        return res.json ({ msg: "invalid Details", success: false }).status(400);
    }
    BulkStages.findOne({ name : processName })
    .then( foundStage => {
        if( foundStage  ){
            return res.json({ msg: "ALREADY Added", success:false }).status( 400 );

        }else{

            BulkStages.findOne({ level : level })
            .then( foudLevelBulk => {
                if( foudLevelBulk ){
                    return res.json ({  msg: "Level can't be Duplicate!", success:false }).status( 400 );
                }else{
                    let newBulkStage = new BulkStages ({
                        name : processName,
                        level: level
                    })
                    newBulkStage.save()
                    .then( sBulkProcess =>{
                        return res.json ({ msg:  "Bulk Process Added!",bulkProcessStage: sBulkProcess,  success:true }).status(200);
                    } )
                    .catch( err=> {
                        console.log( err );
                        return res.json ({ msg : "Error!", success:false }).status(400);
                    })
                }
            } )
            .catch( err=> {
                return res.json ({ msg: "Error", err: err , success:false}).status(400);
            } )
           
        }
    } )
    .catch( err=> {
        console.log( "err" );
        return res.json ({ msg: "Stage already Exist" })
    })

   

} )

Router.post( "/bulk-stage-list" , (req, res)=>{
    BulkStages.find()
    .then( found => {
        if( found.length > 0 ){
            return res.json({ msg: "Bulk List!",List:found,  success:true }).status(200);
        }else{
            return res.json ({ msg: "No Expense Adde Yet!", success:false } ).status(400);
        }
    } )
    .catch( err=> {
        console.log( "err" );
        return res.json ({ msg: "Failed!", success:false }).status(400);
    })
})

/////////////////////////// BULK-Pakging ///////////////////////////////
Router.post( "/packaging-bulk", (req, res) =>{
    const { bulkId, packaging } = req.body;
    let errorMessage = "";
    if( bulkId === "" ){
        errorMessage = "Invalid Bulk Id!";
    }else if( packaging === "" ){
        errorMessage = "Invalid Packaging"
    }else if( packaging.cutPieces.length === "" ){
        errorMessage = "Invalid Cut Pieces Length!";
    }else if( packaging.cutPieces.price === "" ){
        errorMessage = "Invalid Cut Pieces Price!";
    }else if( packaging.finishedPieces.length === "" ){
        errorMessage = "Invalid Finished Piece Length!";
    }else{
        errorMessage = false;
    }

    if( errorMessage === false ){
        Bulk.findOne({ _id: bulkId })
        .then( foundBulk =>{
            if( foundBulk !== null ){
                foundBulk.packaging = packaging ;
                foundBulk.save()
                .then( sfoundBulk =>{
                    if( sfoundBulk !== null ){
                        return  res.json({ msg: "Found!", Bulk : sfoundBulk, success:true }).status( 200 );
                    }else{
                        return res.json ({ msg: "Failed!", success:false }).status( 400 );
                    }
                } )
                .catch( err=>{
                    console.log( "Packiging Catch Error!" );
                    console.log( err );
                    return res.json ({ msg: "Failed!", success:false }).status( 400 );
                } )
            }else{
                return res.json ({ msg: "Bulk Not Found!" , success:false}).status(404);
            }
        } )
        .catch( err=>{
            console.log( err );
            console.log( "Catch error of Bulk Found!" );
            return res.json ({ msg: "Failed!", success:false }).status(400);
        } )
    }else{
        return res.json ({ msg: errorMessage, success:false }).status(400);
    }
} )


/////////////////////////// BULK-AGSINST-ID ///////////////////////////////

Router.post( "/bulk-against-id", (req, res)=>{
    const { bulkId } = req.body ;
    Bulk.findOne({ _id: bulkId })
    .then( foundBulk =>{
        if( foundBulk !== null ){
            return res.json ({ msg: "Bulk Found!",Bulk :foundBulk,  success: true }).status(200);
        }else{
            return res.json({ msg: "Not Bulk Found!", success:false }).status(404);
        }
    } )
    .catch( err =>{
        console.log( err );
        console.log( "catch error" ) 
        return res.json ({ msg: "Failed!", success : false }).status(400);
    } )
} )

const calculateCost=( oldlength, oldPPM, newLength, costThisStep )=>{

    let newPPM  = oldPPM + ( costThisStep / oldlength );
    let totalCost = newCost * newLength ;
    return  { newPPM , totalCost } 
}





/////////////////////////// UPDATE-Dyeing-BULK ///////////////////////////////
Router.post( "/sending-to-dyeing-bulk", (req, res) =>{
    const { sendingToDyeingBulk, bulkId } = req.body;
    // SEND_TO_DYEING_BULK
    let errorMessage = "";
    if( sendingToDyeingBulk.processStage === "" ){
        errorMessage = "Invalid Process Name!";
    }else if(  sendingToDyeingBulk.length === "" ){
        errorMessage= "Invalid Precess length!";
    }else if(  bulkId === "" ){
        errorMessage= "Invalid Bulk Id!";
    }else{
        errorMessage = false;
    }

    if( errorMessage === false ){
        Bulk.findOne({ _id: bulkId })
        // .populate({ path: "process",  options: { sort: { processLevel: 1 } }})
        // .sort({ "process.processStage.level": -1 })
        .then( async foundBulk =>{
            if( foundBulk !== null ){

                let myArray = [];
                let obj = {};
                for (let i = 0; i < foundBulk.process.length; i++) {
                    const element = foundBulk.process[i];
                    
                    if( element.processLevel > foundBulk.process[i+1].processLevel ){

                    }else{
                        console.log( `${element.processLevel > foundBulk.process[i+1].processLevel}` )
                    }
                    let obj = element ;
                    myArray.push( element );

                }
                

                // let data = await separateBulksData( foundBulk, foundBulk.processStage );
                return res.json ({ nextStageProcess: myArray, msg: "Bulk Promoted To Next Level!", success:true }).status( 200 );

                // new calculatioClass().calculate( foundBulk, sendingToDyeingBulk )
                // .then(  nextStageProcess => {
                //     if( nextStageProcess ){
                //         // let bulkStage = await BulkStages.findOne({ _id: newData.processStage });
                        
                //         // let myProcess ={
                //         //     length: nextStageProcess.length,
                //         //     ppm: nextStageProcess.ppm,
                //         //     totalCost: nextStageProcess.totalCost,
                //         //     shortage: nextStageProcess.shortage,
                //         //     processLevel: bulkStage.level,
                //         //     processStage: bulkStage._id,
                //         //     expenseList: newData.expenseList                          
                //         // }
                //         return res.json ({ nextStageProcess: foundBulk, msg: "Bulk Promoted To Next Level!", success:true }).status( 200 );

                //         // foundBulk.process.push( nextStageProcess );
                //         // foundBulk.processStage = sendingToDyeingBulk.processStage ;
                //         // foundBulk.save()
                //         // .then( sFoundBulk => {
                //         //     if( sFoundBulk  ){
                //         //         return res.json ({ msg: "Bulk Promoted To Next Level!", success:true }).status( 200 );
                //         //     }else{
                //         //         return res.json ({ msg: "Failed!", success:false }).status( 400 );
                //         //     }
                //         // } )
                //         // .catch( err=> {
                //         //     console.log( err );
                //         //     return res.json ({ msg: "Bulk Updated To Next Level!", success:false }).status( 400 );
                //         // } )
                //         // return res.json ({ msg: "bulk", bulk : foundBulk,  success:true}).status(200);
                //     }
                // } )
                // .catch( err=> {
                //     return res.json ({ msg: "err" , error: err, success:false}).status( 400 );
                // } )
                // ;
                // new calculatioClass().getPPMWithExpense(oldlength, oldPPM, costThisStep)
                // .then( async costppm => {
                //     let totoalcost = await new calculatioClass().getCost( costppm , oldlength  );
                //     return res.json ({ msg: "Cost!", costppm: costppm, totoalcost:totoalcost }).status(200);
                // } )
                // .catch( err=> {
                //     return res.json ({ msg: "not !", success:false }).status( 400 );
                // } )
                

                // let newPPM  =  await getPPMWithExpense ( oldlength, oldPPM, costThisStep);
                // let newtotoalCost = await getCost ( newPPM , newLength )


                // return res.json ({ msg: "Found" ,Bulk:data, success:true}).status(200);
                // return res.json ({ msg: "notFound" ,Bulk:tests, success:false}).status(200);
                // foundBulk.process.forEach(element => {
                //     console.log( element+ " == " + foundBulk );
                //     if( element.processStage === foundBulk.processStage ){
                //         tests = 1 ;
                //         return res.json ({ msg: "Deying Details Saved!" ,Bulk:tests, success:true}).status(200);

                //     }else{
                //         console.log( "not" );
                //         return res.json ({ msg: "Deying Details Saved!" ,Bulk:tests, success:true}).status(200);

                //     }
                // });
                // if( sendingToDyeingBulk.expenseList.length > 0 ) {
                //     // for( let i = 0 ;  )
                //     expenseCalculator( sendingToDyeingBulk.expenseList );
                // }else{

                // }

                // foundBulk.save()
                // .then( sFoundBulk =>{
                //     if( sFoundBulk !== null ){
                //         return res.json ({ msg: "Deying Details Saved!" ,Bulk:sFoundBulk, success:true}).status(200);
                //     }else{
                //         console.log("Deying Details Not Saved!");
                //         return res.json({ msg: "Deying Details Not Saved!", success:false }).status(400);  
                //     }
                // } ) 
                // .catch( err=>{
                //     console.logO( err );
                //     console.log("Deying Details Failed!");
                //     return res.json({ msg: "Deying Details Failed!", success:false }).status(400);
                // } )
            }else{
                return res.json({ msg: "Bulk Not Found!", success: false  }).status(404);
            }
        } )
        .catch( err=> {
            console.log(err) ;
            console.log( "Bulk Found Catch error" );
            return res.json({ msg: "Error Found!", success : false }).status(400);
        })
    }else{
        return res.json ({ msg : errorMessage, success: false }).status(400);
    }

} )
/////////////////////////// UPDATE-BULK ///////////////////////////////
Router.post ( "/update-new-bulk", (req, res)=>{
    const { newBulk, bulkId, vendor } = req.body;
    let errorMessage = "";
    if( newBulk.length === "" ){
        errorMessage = "Invalid Bulk Length!";
    }else if( newBulk.ppm === "" ){
        errorMessage = "Invalid Price!";
    }else if( newBulk._id === "" ){
        errorMessage = "Invalid New Bulk Id!";
    }else if( newBulk.processStage === "" ){
        errorMessage = "Invalid Process Stage!";
    }else if( vendor === "" ){
        errorMessage= "Vendor Id Missed!";
    }else if( bulkId === "" ){
        errorMessage= "Invalid Bulk Id!";
    }else{
        errorMessage = false;
    }

    if( errorMessage === false ){
        Bulk.findOne({ _id: bulkId })
        .then( async  foundBulk =>{
            if( foundBulk !== null ) {
               for( let i = 0 ; i < foundBulk.process.length ; i++){
                if( foundBulk.process[i]._id.toString() == newBulk._id.toString() ){
                    let bulkStage = await BulkStages.findOne({ _id: newBulk.processStage });
                    console.log ( bulkStage ) ;

                    foundBulk.process[i].length = newBulk.length ;
                    foundBulk.process[i].ppm = newBulk.ppm
                    foundBulk.process[i].processStage = newBulk.processStage ;
                    foundBulk.process[i].processLevel = bulkStage.level ;

                    foundBulk.save()
                    .then( async unewBulk => {
                        if( unewBulk ){
                            let bulk = await Bulk.findOne({ _id : unewBulk._id }).populate({ path: "process.processStage" });
                            // let updatedBulk = await separateBulksData( bulk, newBulk.processStage );

                            return res.json ({ msg: "Bulk Updated Successfully!",updatedBulk: bulk, success: true }).status(200);
                        }else{
                            return res.json ({ msg: "Failed!", success:false }).status(400);
                        }
                    })
                    .catch( err=> {
                        console.log( err );
                    })
                }else{
                    console.log( foundBulk.process[i]._id );
                    console.log( newBulk._id  )
                            // return res.json({ msg: foundBulk.process, success:false }).status(400);
                }
               }
                // foundBulk.initialBulk = initialBulk;
                // foundBulk.save()
                // .then( uBulk =>{
                //     if( uBulk !== null ){
                //         return res.json ({ msg: "Bulk Updated Successfully!",Bulk : uBulk, success: true }).status200;
                //     }else{
                //         return res.json({ msg: "Failed!", success:false }).status(400);
                //     }
                // } )
                // .catch( err=> {
                //     console.log( "Catch Erro Saving Bulk" );
                //     return res.json ({ msg: "Failed!", success:false }).status(400);
                // })
            }else{
                return res.json ({ msg: "Bulk not Found!", success:false }).status(404);
            }
        } )
        .catch( err =>{
            console.log(  err);
            console.log( "Bulk Found CAtch Error!");
            return res.json ({ msg: "Bulk Found Catch Error!", success: false }).status(400);
        }  )

       
    }else{  
        return res.json ({ msg : errorMessage, success: false }).status(400);
    }
})
/////////////////////////// LIST-BULK ////////////////////////////////
Router.post( "/bulks-list", (req, res)=>{
    Bulk.find( ).populate({ path: "process.processStage" })
    .then( foundBulks =>{
        if( foundBulks !== null ){
            return res.json ({ msg: "Bulk List!",Bulks: foundBulks,  success: true }).status(200);
        }else{
            return res.json ({ msg: "No Bulk Added Yet!" , success:false}).status(404);
        }
    } )
    .catch( err=> {
        console.log( "Catch error finding bulk" );
        console.log( err );
        return res.json ({ msg: "Failed!", success:false }).status(400);
    } )
} )
/// filter of data
const separateBulksData = async ( sBulk, stage ) =>{
    let newBulkStageData = {};
    
    for( let i = 0 ; i < sBulk.process.length ; i++ ){
        console.log( sBulk.process[i].processStage._id );
        console.log( stage );
        if( sBulk.process[i].processStage._id.toString() == stage.toString() )
        {
            newBulkStageData = {
                _id : sBulk.process[i]._id,
                length: sBulk.process[i].length,
                ppm: sBulk.process[i].ppm,
                processStage: sBulk.process[i].processStage
            }
            console.log( newBulkStageData );
        }else{
            console.log( "not match" );
        }
    }

    return {
        _id: sBulk._id ,
        processData: newBulkStageData,
        vendor: sBulk.vendor  ,
        processStage: sBulk.processStage
    }
}

///////////////////////////Remove Buljk ////////////////////////////

Router.post("/remove-bulk", (req, res) => {
    let { bulkId } = req.body;
    let message = false;
    if (bulkId === "") {
      message = "Invalid Bulk Id!";
    } else {
      message = false;
    }
    if (message === false) {
      Bulk.findByIdAndDelete({ _id: bulkId }).then(deletedBulk => {
        if (deletedBulk) {
          return res
            .json({
              msg: "Bulk deleted!",
              deletedBulk: deletedBulk,
              success: true
            })
            .status(200);
        } else {
          return res
            .json({
              msg: "Invalid Bulk!",
              success: false
            })
            .status(400);
        }
      });
    } else {
      return res.json({ msg: message, success: false }).status(400);
    }
  });
/////////////////////////// ADD-BULK ////////////////////////////////
Router.post ( "/add-bulk", async (req, res)=>{
    const { createBulk } = req.body;
    let errorMessage = "";
    if( createBulk.process.length === "" ){
        errorMessage = "Invalid Bulk Length!";
    }else if( createBulk.process.ppm === "" ){
        errorMessage = "Invalid Price!";
    }else if( createBulk.process.processStageId === "" ){
        errorMessage = "Invalid Process Id!";
    }else if(  createBulk.vendor === "" ){
        errorMessage= "Select Vendor!";
    }else{
        errorMessage = false;
    }

    if( errorMessage === false ){
        let bulkStage = await BulkStages.findOne({ _id: createBulk.process.processStage })
        // .then( bulkStage =>{
        //     if( bulkStage ){
        //         return res.json ({ bulkStage: bulkStage.level });
        //     }
        // }  )
        // .catch( err=> {
        //     console.log( err );
        // } )
        let myProcess = {
            length: createBulk.process.length ,
            ppm: createBulk.process.ppm ,
            processStage: createBulk.process.processStage,
            processLevel: bulkStage.level    
        }
        let newBulk = new Bulk({
            process: myProcess,
            vendor: createBulk.vendor,
            processStage: createBulk.process.processStage,
        })

        newBulk.save()
        .then( async sBulk =>{
            if( sBulk !== null ){
                // filtering data against processStage 
                let bulk = await Bulk.findOne({ _id : sBulk._id }).populate({ path: "process.processStage" });
                // console.log( bulk.process[0].processStage )  ;
                // let findDataNewStage = await separateBulksData ( bulk , createBulk.process.processStage );
                // console.log( findDataNewStage );
                
                return res.json ({ msg: "Bulk Added Successfully!", bulk: bulk, success: true }).status(200);
            }else{
                return res.json({ msg: "Failed!", success:false }).status(400);
            }
        } )
        .catch( err=> {
            console.log( "Catch Erro Saving Bulk" );
            return res.json ({ msg: "Failed!", success:false }).status(400);
        })
    }else{  
        return res.json ({ msg : errorMessage, success: false }).status(400);
    }
})



module.exports = Router;
