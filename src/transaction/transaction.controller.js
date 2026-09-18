import TransactionModel from "./transaction.model.js";

const createTransaction = async (req, res) => {
    try {
        const data = req.body;
        const {id} = req.user;
        data.userId = id;
        await new TransactionModel(data).save();
        res.json({message: "Transaction created successfully"});
    } catch(err) {
        res.status(500).json({message: err.message || "Internal Server Error"});
    }
}

const updateTransaction = async (req, res) => {
    try {
        const data = req.body;
        const {id} = req.params;
        const transaction = await TransactionModel.findByIdAndUpdate(id, data, {new: true});
        if(!transaction) {
            return res.status(404).json({message: "Transaction not found"});
        }
        res.json({message: "Transaction updated successfully"});
    } catch(err) {
        res.status(500).json({message: err.message || "Internal Server Error"});
    } 
}

const deleteTransaction = async (req, res) => {
    try {
        const {id} = req.params;
        const transaction = await TransactionModel.findByIdAndDelete(id);
        if(!transaction) {
            return res.status(404).json({message: "Transaction not found"});
        }
        res.json({message: "Transaction deleted successfully"});
    } catch(err) {
        res.status(500).json({message: err.message || "Internal Server Error"});
    }
}

const readTransaction = async (req, res) => {
    try {
        const {id} = req.user;
        const {page, limit} = req.query;
        const skip = (page - 1) * limit;
        const transaction = await TransactionModel.find({userId: id}).sort({createdAt: -1}).lean().skip(skip).limit(limit);
        if(!transaction) {
            return res.status(404).json({message: "Transaction not found", transactionInfo: []});
        }
        const totalTransactions = await TransactionModel.countDocuments({userId: id});
        res.json({message: "Transaction fetched successfully", transactionInfo: transaction, totalTransactions});
    } catch(err) {
        res.status(500).json({message: err.message || "Internal Server Error"});
    } 
}

export {createTransaction, updateTransaction, deleteTransaction, readTransaction};