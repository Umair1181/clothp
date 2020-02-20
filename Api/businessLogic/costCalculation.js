const { BulkStages } = require("../../Modal");
class CostCalculationClass{
    constructor(  ){
        this.length = "";
        this.ppm = "";
        this.totalCost = "";
        this.shortage = "";
        this.processItem  = [];
    }

    async processCalculator(){
        
        return this;
    }

    async setValues (  ppm, length, cost  ){
        this.length = length;
        this.ppm = ppm;
        this.totalCost = cost;
        return this;
    }


    async calculate( fBulk, newData){
        for( let i = 0 ; i < fBulk.process.length ; i++ ){
            if(fBulk.process[i].processLevel === 1 ){
                await this.setValues( fBulk.process[i].ppm, fBulk.process[i].length, newData.totalExpenseCost );
            }
           
            this.ppm = await this.getPPMWithExpense( this.totalCost ) ;
            this.ppm = await this.getppmShortage( newData.length );
            this.totalCost = await this.getCost( newData.length );

            this.processItem.push( {processLevel: fBulk.process[i].processStage.level,
                  processStage: fBulk.process[i].processStage._id,  
                  shortage: this.shortage, ppm :this.ppm, 
                  totalCost: this.totalCost, length: newData.length } )
        }
        //  fBulk.processData.ppm;
        // this.totalCost = await this.getCost()  ;
        // let bulkStage = await BulkStages.findOne({ _id: newData.processStage });
        // this.processLevel = bulkStage.level;
        // this.processStage = bulkStage._id;
        // this.expenseList = newData.expenseList;
        return this.processItem;
    }
    
    async getppmShortage ( newLength ){
        let shortage = this.length - newLength  ;
        this.shortage = shortage;
        console.log( `${this.ppm} + ( ( ${this.ppm} * ${shortage} ) / ( ${this.length} - ${shortage} ) ) ` );
        // console.log( shortage );
        // console.log( this.length );
        this.ppm = Math.round ( this.ppm + ( ( this.ppm * shortage ) / ( this.length - shortage ) )) ;
        console.log( this.ppm );
        return this.ppm ;
    }

    async getPPMWithExpense ( cost ) {
        this.ppm = Math.round( await (  this.ppm + ( cost / this.length )));
        return this.ppm;
    }

    async getCost ( newLength ){
        console.log( `${this.ppm} * ${newLength}` )
        this.totalCost = Math.round( await ( this.ppm * newLength ));
        return this.totalCost ;
    }

    
}
module.exports = CostCalculationClass;