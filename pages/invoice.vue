<script setup lang="ts">
import { useFetch } from 'nuxt/app';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const result = ref()

interface Invoice {
    name: string
    phoneNo: string
    postNo: string
    address: string
    addressDetail: string
    memo: string
    count: number
    count2: number
    state: string
    regTime: string
}

const invoiceList = ref<Array<Invoice>>([])

const password = ref('')
const cursor = ref()
const hasMore = ref(true)

const apiCall = async () => {
    if (!password.value) {
        password.value = prompt('비밀번호를 입력해주세요.') ?? '';
    }

    const requestBody: any = {
        type: 'LIST',
        password: password.value
    }

    if (cursor.value) {
        requestBody.cursor = cursor.value
    }
    

    const { data: result } = await useFetch('/api/pitch', {
        method: 'POST',
        body: requestBody
    })

    if ((result.value as any)?.code === 200) {

        const list = (result.value as any)?.list
        
        const resultList: Array<Invoice> = []

        for (const item of (list as any).results as any) {
            invoiceList.value?.push({
                name: item.properties['이름']?.title[0]?.plain_text ?? '',
                phoneNo: item.properties['전화번호']?.rich_text[0]?.plain_text ?? '',
                postNo: item.properties['우편번호']?.rich_text[0]?.plain_text ?? '',
                address: item.properties['주소']?.rich_text[0]?.plain_text ?? '',
                addressDetail: item.properties['상세주소']?.rich_text[0]?.plain_text ?? '',
                memo: item.properties['요청사항']?.rich_text[0]?.plain_text ?? '',
                count: item.properties['수량(3kg)']?.number ?? '',
                count2: item.properties['수량(2kg)']?.number ?? '',
                state: item.properties['상태']?.select?.name ?? '',
                regTime: item.created_time?.substring(0, 19)
            })
        }
        
        cursor.value = (result.value as any)?.list.next_cursor
        hasMore.value = (result.value as any)?.list.has_more

        // invoiceList.value = invoiceList.value

        console.log('cursor.value', cursor.value)
        console.log('hasMore.value', hasMore.value)

    } else {
        alert ((result.value as any)?.message ?? 'fail...')
    }
}

</script>

<template>
    <v-container>
        <h2 class="text-center text-h4 font-weight-black text-orange mb-10">다정농원 대극천 복숭아<br/>주문목록</h2>
        <v-list density="compact">
            <v-list-item
                v-for="(invoice, index) in invoiceList"
            >
                <v-card
                    variant="outlined"
                    class="mx-auto mb-3"
                    color="surface-variant"
                >   
                    <div>
                        <div class="d-flex align-center justify-center flex-no-wrap justify-space-between">
                            <v-card-title class="text-h8">{{invoice.name}}</v-card-title>
                            <v-card-subtitle class="text-h6 text-left px-0"><v-icon icon="mdi-phone" class="mr-2" size="x-small" ></v-icon>{{invoice.phoneNo}}</v-card-subtitle>
                            <v-card-actions>
                                <div class="btn-wrap">
                                    <!-- <v-btn 
                                    v-if="invoice.state !== '발송완료'"
                                    :visible="false"
                                    class="ms-2"
                                    size="small"
                                    text="완료처리"
                                    variant="outlined"
                                    ></v-btn> -->
                                </div>
                            </v-card-actions>
                        </div>
                    </div>
                    <div>
                        <v-container>
                            <v-row> 
                                <v-col class="pa-0 pl-3 text-caption" cols="3" sm="3">수량(3kg)</v-col>
                                <v-col class="pa-0" cols="9" sm="9">{{ invoice.count ? `${invoice.count} 박스` : '-' }}
                                    <v-chip v-if="invoice.state === '발송완료'" class="mb-1" size="small" color="green" variant="outlined" label>
                                        발송완료
                                    </v-chip>
                                    <v-chip v-if="invoice.state === '주문취소'" class="mb-1" size="small" color="gray" variant="outlined" label>
                                        주문취소
                                    </v-chip>
                                    <v-chip v-if="invoice.state === '입금완료'" class="mb-1" size="small" color="blue" variant="outlined" label>
                                        입금완료
                                    </v-chip>
                                    <v-chip v-if="invoice.state === '주문접수'" class="mb-1" size="small" color="red" variant="outlined" label>
                                        주문접수
                                    </v-chip>

                                </v-col>
                            </v-row>
                            <v-row> 
                                <v-col class="pa-0 pl-3 text-caption" cols="3" sm="3">수량(2kg)</v-col>
                                <v-col class="pa-0" cols="9" sm="9">{{ invoice.count2 ? `${invoice.count2} 박스` : '-' }}</v-col>
                            </v-row>
                            <v-row> 
                                <v-col class="pa-0 pl-3 text-caption" cols="3" sm="3">주소</v-col>
                                <v-col class="pa-0" cols="9" sm="9">{{ `${invoice.postNo} ${invoice.address} ${invoice.addressDetail}` }}</v-col>
                            </v-row>
                            <v-row> 
                                <v-col class="pa-0 pl-3 text-caption" cols="3" sm="3">요청사항</v-col>
                                <v-col class="pa-0" cols="9" sm="9">{{ invoice.memo }}</v-col>
                            </v-row>
                        </v-container>
                    </div>
                </v-card>
            </v-list-item>
        </v-list>
        <div class="d-flex align-center justify-center flex-no-wrap justify-space-between">
            <v-btn v-if="hasMore" class="mx-auto" @click="apiCall()">더보기</v-btn>
        </div>
    </v-container>
</template>

<style scoped>
.my-frame {
    max-width: 700px;
    margin: 0 auto;
}
.btn-wrap {
    width: 90px;
}
</style>