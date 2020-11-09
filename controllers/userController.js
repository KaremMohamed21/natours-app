const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// save the req.file.photo (user photo) to memory as buffer
const multerStorage = multer.memoryStorage();

// filter uploaded photo to check if its image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. please upload only image', 404), false);
  }
};

// create multer object to get multipart form data (images) from the req.file
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

// Create filter out function to filter body elements
// get only fields to update
const filterObj = (obj, ...allowedObj) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedObj.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// get Uploaded user photo
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserphoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Check if the user posted a password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('You cannot update the password from here', 400));
  }

  // 2) filter out the body object from unwanted
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // Update active property to false
  const deletedUser = await User.findByIdAndUpdate(
    req.user.id,
    { active: false },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(204).json({
    status: 'success',
    data: {}
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'This route has not been created! please use /signup to create new user'
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
