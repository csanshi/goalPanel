// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
    const { goalId, beginDate, endDate, summary, time } = event

    if(!goalId){
        return
    }

    try{
        await db
            .collection('goal-records')
            .where({
                goalId
            })
            .update({
                data: {
                    records: _.push([
                        {
                            summary,
                            beginDate,
                            endDate,
                            time
                        }
                    ])
                }
            })

        await db
            .collection('goals')
            .doc(goalId)
            .update({
                data:{
                    time: _.inc(parseInt(time)),
                    lastUpdate: endDate
                }
            })
    }catch(e){
        console(e)
        return e
    }
}