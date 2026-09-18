import {model, Schema} from "mongoose";

const transactionSchema = new Schema({
    transactionType: {
        type: String,
        enum: ["cr", "dr"],
        trim: true,
        lowercase: true,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User", // collection name of User model in db
        required: true
    },
    title: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["cc", "dc", "cash", "upi"],
        required: true
    },
    notes: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
    }
}, {timestamps: true});

const TransactionModel = model("Transaction", transactionSchema);

export default TransactionModel;
