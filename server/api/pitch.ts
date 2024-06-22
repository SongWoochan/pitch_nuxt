import { Client }  from '@notionhq/client'
import { ErrorTypes } from 'vue-router'

export default defineEventHandler(async (event) => {

    const runtimeConfig = useRuntimeConfig()
    
    const secretKey = runtimeConfig.notionToken
    const databaseId = runtimeConfig.notionDatabasePitch
    const password = runtimeConfig.notionPassword

    const body = await readBody(event)

    console.log('body', body)

    if (body.type === 'ADD') {
        
            if (!body.name || !body.phoneNo || !body.postNo) {
                return { code: 200, message: 'empty' }
            }
            
            try {
        
            const repo = await $fetch('https://api.notion.com/v1/pages/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": 'application/json',
                    "Notion-Version": '2022-06-28'
                },
                body: JSON.stringify({
                    parent: {
                        "database_id": databaseId,
                    },
                    properties: {
                        "이름": { 
                            type: "title",
                            title: [{ type: "text", text: { content: body.name } }],
                        },
                        "전화번호": { 
                            type: "rich_text",
                            rich_text: [{ type: "text", text: { content: body.phoneNo } }],
                        },
                        "우편번호": { 
                            type: "rich_text",
                            rich_text: [{ type: "text", text: { content: body.postNo } }],
                        },
                        "주소": { 
                            type: "rich_text",
                            rich_text: [{ type: "text", text: { content: body.address } }],
                        },
                        "상세주소": { 
                            type: "rich_text",
                            rich_text: [{ type: "text", text: { content: body.addressDetail } }],
                        },
                        "요청사항": { 
                            type: "rich_text",
                            rich_text: [{ type: "text", text: { content: body.memo } }],
                        },
                        "수량(3kg)": { 
                            type: "number",
                            number: Number(body.count),
                        },
                        "수량(2kg)": { 
                            type: "number",
                            number: Number(body.count2),
                        },
                    },
                })
            })
                return { code: 200, message: repo }
        
            } catch (error) {
                if (error instanceof Error) {
        
                    console.error(error.stack?.toString)
                    return { code: 500, message: `${error.message}` }
                }
            }
            

            
    } else if (body.type === 'LIST') {
        // 목록 가져오기
        
        if (!body.password || body.password !== password) {
            return { code: 400, message: '잘못된 비밀번호' }
        }
        
        try {

            const requestBody: any = {
                "page_size": 20,
                "sorts": [
                    {
                        "timestamp": "created_time",
                        "direction": "descending"
                    }
                ],
            }
            
            if (body.cursor) {
                requestBody.start_cursor = body.cursor
            }

            const list = await $fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": 'application/json',
                    "Notion-Version": '2022-06-28'
                },
                body: JSON.stringify(requestBody)
            })


            
            return { code: 200, message: 'success', list: list }

        } catch (error) {
            console.error(error)
            if (error instanceof Error) {

                return { code: 500, message: `${error.message}` }
            }
        }
    }

})