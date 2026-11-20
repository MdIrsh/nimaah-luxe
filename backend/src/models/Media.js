import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    contentType: {
      type: String,
      default: 'image/jpeg',
    },
    data: {
      type: Buffer,
      required: true,
    },
    base64Url: {
      type: String,
    },
    size: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Media = mongoose.model('Media', mediaSchema);
export default Media;
