import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[MongoDB Error]: MONGO_URI is not defined in backend/.env');
    process.exit(1);
  }

  if (uri.includes('<db_password>')) {
    console.error(
      '[MongoDB Error]: Please replace <db_password> in backend/.env with your actual MongoDB Atlas password for mdirshadkhan847233_db_user.'
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB Atlas Connected]: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.error(
      'Hint: Verify your password in backend/.env and ensure your IP (or 0.0.0.0/0) is whitelisted under MongoDB Atlas -> Network Access.'
    );
    process.exit(1);
  }
};
