// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

    const { goalId, goalTitle } = event
    if(!goalId || !goalTitle) return

    try{
        const result = await db.collection('goals')
            .doc(goalId)
            .update({
                data:{
                    title: goalTitle
                }
            })
        result.data = {
            goalId,
            goalTitle
        }
        return result
    }catch(e){
        console.log(e)
        return e
    }
}