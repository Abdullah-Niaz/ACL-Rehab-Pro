import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const schema=new mongoose.Schema({
  name:{type:String,required:true},
  email:{type:String,required:true,unique:true,lowercase:true},
  password:{type:String,required:true},
  role:{type:String,enum:['doctor','patient'],default:'patient'},
  isActive:{type:Boolean,default:true},
  inviteToken:String,
  inviteTokenExpires:Date
},{timestamps:true});
schema.pre('save',async function(next){if(!this.isModified('password')) return next(); this.password=await bcrypt.hash(this.password,10); next();});
schema.methods.matchPassword=function(p){return bcrypt.compare(p,this.password)};
export default mongoose.model('User',schema);
