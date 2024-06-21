import { Client }  from '@notionhq/client'
import { ErrorTypes } from 'vue-router'

const config = useRuntimeConfig()
// Initializing a client
const notion = new Client({
    auth: 'secret_1PBR9ciZwc4smO4MpCJrmp8T0J8VOVRKqV47RbwKxyv',
    fetch 
})

export default defineEventHandler(async (event) => {

    const body = await readBody(event)

    console.log('body', body)

      
    try {
        // const list = await notion.databases.query({
        //     "database_id": process.env.NOTION_DATABASE_PITCH?? '',
        //     // filter: {
        //     //     property: "Landmark",
        //     //     rich_text: {
        //     //     contains: "Bridge",
        //     //     },
        //     // },
        // })
        // console.log('list', list)
        

        const response = await notion.pages.create({
            parent: {
                "database_id": '5bb8e896de6a48e2b3d5542b4ee988da',
            },
            properties: {
                "이름": { 
                    type: "title",
                    title: [{ type: "text", text: { content: body.name } }],
                },
                "전화번호": { 
                    type: "rich_text",
                    rich_text: [{ type: "text", text: { content: body.name } }],
                },
                "우편번호": { 
                    type: "rich_text",
                    rich_text: [{ type: "text", text: { content: body.name } }],
                },
                "주소": { 
                    type: "rich_text",
                    rich_text: [{ type: "text", text: { content: body.name } }],
                },
                "상세주소": { 
                    type: "rich_text",
                    rich_text: [{ type: "text", text: { content: body.name } }],
                },
                "요청사항": { 
                    type: "rich_text",
                    rich_text: [{ type: "text", text: { content: body.name } }],
                },
                "수량": { 
                    type: "number",
                    number: Number(body.count),
                },
            },
        });

        return { code: 200, message: response }

    } catch (error) {
        if (error instanceof Error) {

            console.error(error.stack?.toString)
            return { code: 500, message: error.message + error.stack?.toString }
        }
    }
    

})