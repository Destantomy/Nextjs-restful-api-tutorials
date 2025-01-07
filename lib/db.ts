import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
    const connectionState = mongoose.connection.readyState;

    if(connectionState === 1) {
        console.log('already connected');
        return;
    }

    if (connectionState === 2) {
        console.log('connecting..');
        return;
    }

    try {
        mongoose.connect(MONGODB_URI!, {
            dbName: 'next14restapi',
            bufferCommands: true
        })
    } catch (error: any) {
        console.log('error :', error);
        throw new Error('error :', error);
    }
};

export default connect;