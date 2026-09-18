import TransactionModel from "../transaction/transaction.model.js";

const getReport = async (req, res) => {
    try {
        const {id, role} = req.user;
        let transactions = [];
        if(role === "admin") {
            transactions = await TransactionModel.find().lean();
        } else {
            transactions = await TransactionModel.find({userId: id}).lean();
        }

        let totalCredit = 0;
        let totalDebit = 0;

        transactions.forEach((txn) => {
            if(txn.transactionType === "cr") {
                totalCredit += txn.amount;
            } else if(txn.transactionType === "dr") {
                totalDebit += txn.amount;
            }
        });
        const totalBalance = totalCredit - totalDebit;
        const totalTransactions = transactions.length;
        
        const dailyTransactions = {};
        transactions.forEach((txn) => {
            const date = new Date(txn.createdAt).toISOString().slice(0, 10);
            dailyTransactions[date] = (dailyTransactions[date] || 0) + txn.amount;
        })

        const last30days = []
        for(let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateSTR = d.toISOString().slice(0, 10);
            last30days.push({
                date: dateSTR,
                total: dailyTransactions[dateSTR] || 0
            });
        }

        const estimate = (value) => Math.floor(value + (value * 0.15)); 
        
        res.status(200).json({
            summary: {
                totalCredit,
                totalDebit,
                totalBalance,
                totalTransactions,
                estimatedTransactions: estimate(totalTransactions),
                estimatedCredit: estimate(totalCredit),
                estimatedDebit: estimate(totalDebit),
                estimatedBalance: estimate(totalBalance)
            },
            chart: last30days
        });
    } catch(err) {
        res.status(500).json({message: err.message || "Internal Server Error"});
    }
}

export {getReport};