// @desc Get all hospitals
// @route GET /api/v1/hospitals 
// @access Public
const Hospital = require('../models/Hospital.js');
const Appointment = require('../models/Appointment');

exports.getHospitals= async (req,res,next)=>{
    
    let query;

    const reqQuery = {...req.query};
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);


    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    query = Hospital.find(JSON.parse(queryStr)).populate('appointments');
    

    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Hospital.countDocuments();

    try {
        const total = await Hospital.countDocuments();
        query = query.skip(startIndex).limit(limit);

        const hospitals = await query;
        
        const pagination = {};
        if(endIndex < total){
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0){
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status (200).json({success:true, count:hospitals.length, data:hospitals});
    } catch (err) {
        res.status (400).json({success:false});
    }
};

// @desc Get single hospital
// @route GET /api/v1/hospitals/:id
// @access Public
exports.getHospital= async (req, res,next)=>{
    try{
        const hospital = await Hospital.findById(req.params.id);
        if(!hospital){
            return res.status(400).json({success:false});
        }
        res.status (200).json({success:true, data:hospital});
    } catch (err) {
        res.status (400).json({success:false});
    }
};

// @desc Create new hospital
// @route POST /api/v1/hospitals
// @access Private
exports.createHospital= async (req,res,next)=>{
    const hospital = await Hospital.create(req.body);
    res.status (201).json({
        success:true, 
        data:hospital
    });
};

// @desc Update hospital
// @route PUT /api/v1/hospitals/:id
// @access Private
exports.updateHospital=async(req,res,next)=>{
    try{
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new:true,
            runValidators:true
        });

        if(!hospital){
            return res.status(400).json({success:false});
        }

        res.status (200).json({success:true, data:hospital});
    }catch (err) {
        res.status (400).json({success:false});
    }
}

// @desc Delete hospital
// @route DELETE /api/v1/hospitals/:id
// @access Private
exports.deleteHospital = async(req,res,next)=>{
    try{
        const hospital = await Hospital.findById(req.params.id);
        if(!hospital){
            return res.status(400).json({success:false, message:`Hospital not found with id of ${req.params.id}`});
        }

        await Appointment.deleteMany({hospital: req.params.id});
        await Hospital.deleteOne({_id: req.params.id});
        res.status (200).json({success:true, data:{}});
    }catch (err) {
        res.status (400).json({success:false});
    }
};
