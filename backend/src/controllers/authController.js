import User from '../models/User.js';
import { signToken } from '../utils/token.js';
export async function register(req,res){const {name,email,password,role}=req.body; const exists=await User.findOne({email}); if(exists) return res.status(400).json({message:'Email already exists'}); const user=await User.create({name,email,password,role}); res.status(201).json({token:signToken(user),user:{id:user._id,name:user.name,email:user.email,role:user.role}})}
export async function login(req,res){const {email,password}=req.body; const user=await User.findOne({email}); if(!user||!(await user.matchPassword(password))) return res.status(401).json({message:'Invalid credentials'}); res.json({token:signToken(user),user:{id:user._id,name:user.name,email:user.email,role:user.role}})}
export async function me(req,res){res.json({user:req.user})}
