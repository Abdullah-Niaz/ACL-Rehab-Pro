import ClinicalNote from '../models/ClinicalNote.js';
export async function addNote(req,res){res.status(201).json(await ClinicalNote.create({...req.body,doctor:req.user._id}))}
export async function getNotes(req,res){res.json(await ClinicalNote.find({patient:req.params.patientId}).sort('-createdAt'))}
