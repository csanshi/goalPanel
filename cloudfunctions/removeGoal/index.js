// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _  = db.command

// 云函数入口函数
exports.main = async (event, context) => {
    const { goalId } = event

    if(!goalId){
        return
    }

    try{
        await db
            .collection('goal-records')
            .where({
                goalId
            })
            .remove()
        
        await db
            .collection('goals')
            .doc(goalId)
            .remove()
    }catch(e){
        console.log(e)
    }
}