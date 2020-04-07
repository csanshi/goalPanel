// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
    const { userId, goalTitle} = event  // userId, goalTitle顺序没关系，因为event不是列表，而是obj

    if (!userId || !goalTitle) return

    try {
        const goal = await db.collection('goals').add({
            data:{
                userId,
                title: goalTitle,
                createDate: new Date(),
                lastUpdate: null,
                time: 0
            }
        })

        await db.collection('goal-records').add({
            data: {
                goalId: goal._id
            }
        })
    }catch(e){
        console.log(e)
    }
}