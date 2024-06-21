import { Client }  from '@notionhq/client'

// Initializing a client
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
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
                "database_id": process.env.NOTION_DATABASE_PITCH ?? '',
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
        console.error(error)
        return { code: 500, message: error }
    }
    

})