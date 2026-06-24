import mongoose from 'mongoose';
const ExerciseSchema=new mongoose.Schema({name:String,category:String,sets:String,reps:String,tempo:String,rest:String,load:String,frequency:String,progressionNotes:String,status:{type:String,enum:['Continue','Progress','Replace','Remove'],default:'Continue'}},{_id:true});
const WeekSchema=new mongoose.Schema({weekNumber:Number,focus:String,exercises:[ExerciseSchema]},{_id:true});
const PhaseSchema=new mongoose.Schema({phaseNumber:Number,title:String,objective:String,entryCriteria:[String],exitCriteria:[String],redFlags:[String],weeks:[WeekSchema]},{_id:true});
const schema=new mongoose.Schema({
  patientId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  doctorId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  phases:[PhaseSchema]
},{timestamps:true});
export default mongoose.model('RehabPlan',schema);
