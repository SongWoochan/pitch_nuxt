<script setup lang="ts">
import { useFetch } from 'nuxt/app';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const runtimeConfig = useRuntimeConfig()

useHead({
	title: '복숭아 주문 현황',
    meta: [
        { property:'og:image', content: `${runtimeConfig.public.DOMAIN}/img/invoice_preview.png` },
    	{ name: 'description', content: '복숭아 주문 현황 페이지입니다.' }
    ]
})


const price3kg = Number(runtimeConfig.public.PRICE_3KG ?? 0)
const price2kg = Number(runtimeConfig.public.PRICE_2KG ?? 0)

const router = useRouter()

const result = ref()

interface Invoice {
    name: string
    receiver: string
    phoneNo: string
    postNo: string
    address: string
    addressDetail: string
    memo: string
    count: number
    count2: number
    state: string
    regTime: string
    pageId: string
    comment: string
}

const invoiceList = ref<Array<Invoice>>([])

const isAuth = ref(false)
const password = ref('')
const cursor = ref()
const hasMore = ref(true)

const isLoading = ref(false)

const searchList = async () => {
    isLoading.value = true

    const requestBody: any = {
        type: 'LIST',
        password: password.value,
        state: searchState.value
    }

    if (cursor.value) {
        requestBody.cursor = cursor.value
    }
    

    const result = await $fetch('/api/pitch', {
        method: 'POST',
        body: requestBody
    })

    if ((result as any)?.code === 200) {

        const list = (result as any)?.list
        
        const resultList: Array<Invoice> = []

        for (const item of (list as any).results as any) {
            invoiceList.value?.push({
                name: item.properties['이름']?.title[0]?.plain_text ?? '',
                receiver: item.properties['받는사람']?.rich_text[0]?.plain_text ?? '',
                phoneNo: item.properties['전화번호']?.rich_text[0]?.plain_text ?? '',
                postNo: item.properties['우편번호']?.rich_text[0]?.plain_text ?? '',
                address: item.properties['주소']?.rich_text[0]?.plain_text ?? '',
                addressDetail: item.properties['상세주소']?.rich_text[0]?.plain_text ?? '',
                memo: item.properties['요청사항']?.rich_text[0]?.plain_text ?? '',
                count: item.properties['수량(3kg)']?.number ?? '',
                count2: item.properties['수량(2kg)']?.number ?? '',
                state: item.properties['상태']?.select?.name ?? '',
                regTime: dateFormat(new Date(item.created_time)),
                pageId: item.id,
                comment: item.properties['비고']?.rich_text[0]?.plain_text ?? '',
            })
        }
        
        cursor.value = (result as any)?.list.next_cursor
        hasMore.value = (result as any)?.list.has_more

        if (!isAuth.value) isAuth.value = true

    } else {
        alert ((result as any)?.message ?? 'fail...')
        password.value = ''
        searchReset()
    }
    
    isLoading.value = false
}


const updateState = async (pageId: string, state: string) => {
    isLoading.value = true
    
    const result = await $fetch('/api/pitch', {
        method: 'POST',
        body: {
            type: 'UPDATE',
            pageId: pageId,
            state: state
        }
    })


    if ((result as any)?.code === 200) {
        const invoice = invoiceList.value.find(v => v.pageId === pageId)
        if (invoice) {
            invoice.state = state
        }

    } else {
        alert ((result as any)?.message ?? 'fail...')
    }

    isLoading.value = false
}

const login = () => {
    if (!password.value) {
        alert('비밀번호를 입력해주세요.')
        return false
    }
    searchList()
}

const tabs = [
    { text: '전체', value: '전체'},
    { text: '주문접수', value: '주문접수'},
    { text: '입금완료', value: '입금완료'},
    { text: '발송완료', value: '발송완료'},
    { text: '주문취소', value: '주문취소'},
]

const tab = ref('전체')
const searchState = ref('')

const searchReset = () => {
    hasMore.value = true
    cursor.value = ''
    invoiceList.value = []
}

watch(tab, () => {
    searchReset()

    if (tab.value === '전체') {
        searchState.value = ''
    } else {
        searchState.value = tab.value
    }

    searchList()

})

const dateFormat = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    const monthStr = month >= 10 ? month : '0' + month;
    const dayStr = day >= 10 ? day : '0' + day;
    const hourStr = hour >= 10 ? hour : '0' + hour;
    const minuteStr = minute >= 10 ? minute : '0' + minute;
    const secondStr = second >= 10 ? second : '0' + second;

    return `${date.getFullYear()}-${monthStr}-${dayStr} ${hourStr}:${minuteStr}`
}

const totalPrice = (count: number, count2: number) => {
    const price = (count * price3kg) + (count2 * price2kg)
    return priceFomat(price)
}
</script>

<template>
    <v-container class="my-frame pa-0">
        <v-overlay  class="d-flex align-center justify-center flex-wrap text-center" v-model="isLoading">
            <v-progress-circular indeterminate></v-progress-circular>
        </v-overlay>   
        <h2 class="text-center text-h4 font-weight-black text-green my-6">다정농원 대극천 복숭아<br/>주문목록</h2>
        <v-sheet v-if="!isAuth" rounded="lg">
            <v-card
            class="mx-auto pa-12 pb-8"
            max-width="400"
            rounded="lg"
            >
                <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
                    비밀번호
                </div>
                <v-text-field
                    v-model="password"
                    :type="'password'"
                    density="compact"
                    placeholder="Enter your password"
                    prepend-inner-icon="mdi-lock-outline"
                    variant="outlined"
                ></v-text-field>
                <v-btn class="mb-8" color="black" size="large" variant="tonal" block @click="login">로그인</v-btn>
            </v-card>
        </v-sheet>
        <template v-if="isAuth">
            <v-sheet rounded="lg">
                <v-tabs
                v-model="tab"
                :items="tabs"
                align-tabs="center"
                height="40"
                slider-color="#f78166"
                >
                    <template v-slot:tab="{ item }">
                        <v-tab
                        :text="item.text"
                        :value="item.value"
                        class="text-none"
                        ></v-tab>
                    </template>
                </v-tabs>
            </v-sheet>
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
                                        <v-btn class="float-right" >
                                            <v-icon icon="mdi-pencil"  size="x-large"></v-icon>
                                            <v-menu
                                            activator="parent"
                                            location="bottom end"
                                            transition="fade-transition"
                                            >
                                            <v-list
                                                density="compact"
                                                rounded="lg"
                                                slim
                                            >
                                                <v-list-item ><v-btn color="green" variant="outlined" @click="updateState(invoice.pageId, '발송완료')">발송완료</v-btn></v-list-item>
                                                <v-list-item ><v-btn color="blue"  variant="outlined" @click="updateState(invoice.pageId, '입금완료')">입금완료</v-btn></v-list-item>
                                                <v-list-item ><v-btn color="red"   variant="outlined" @click="updateState(invoice.pageId, '주문접수')">주문접수</v-btn></v-list-item>
                                                <v-list-item ><v-btn color="gray"  variant="outlined" @click="updateState(invoice.pageId, '주문취소')">주문취소</v-btn></v-list-item>
                                            </v-list>
                                            </v-menu>
                                        </v-btn>
                                    </div>
                                </v-card-actions>
                            </div>
                        </div>
                        <div>
                            <v-container>
                                <v-row> 
                                    <v-col class="pa-0 pt-1 pl-3 text-caption" cols="3" sm="3">주문일시</v-col>
                                    <v-col class="pa-0" cols="9" sm="9">{{ invoice.regTime }}
                                        <v-chip v-if="invoice.state === '발송완료'" class="ml-2 mb-1" size="small" color="green" variant="outlined" label>
                                            발송완료
                                        </v-chip>
                                        <v-chip v-if="invoice.state === '주문취소'" class="ml-2 mb-1" size="small" color="gray" variant="outlined" label>
                                            주문취소
                                        </v-chip>
                                        <v-chip v-if="invoice.state === '입금완료'" class="ml-2 mb-1" size="small" color="blue" variant="outlined" label>
                                            입금완료
                                        </v-chip>
                                        <v-chip v-if="invoice.state === '주문접수'" class="ml-2 mb-1" size="small" color="red" variant="outlined" label>
                                            주문접수
                                        </v-chip>
    
                                    </v-col>
                                </v-row>
                                <v-row> 
                                    <v-col class="pa-0 pt-1 pl-3 text-caption" cols="3" sm="3">수량(3kg)</v-col>
                                    <v-col class="pa-0" cols="9" sm="9">{{ invoice.count ? `${invoice.count} 박스` : '-' }}</v-col>
                                </v-row>
                                <v-row> 
                                    <v-col class="pa-0 pt-1 pl-3 text-caption" cols="3" sm="3">수량(2kg)</v-col>
                                    <v-col class="pa-0" cols="4" sm="4">{{ invoice.count2 ? `${invoice.count2} 박스` : '-' }}</v-col>
                                    <v-col class="pa-0 pt-5 pb-5 d-flex align-end justify-end flex-wrap text-right " cols="5" sm="5">
                                        <v-field-label class="">총 {{ totalPrice(invoice.count, invoice.count2) }} 원</v-field-label>
                                    </v-col>
                                </v-row>
                                <v-row> 
                                    <v-col class="pa-0 pt-1 pl-3 text-caption" cols="3" sm="3">받는사람</v-col>
                                    <v-col class="pa-0" cols="9" sm="9">{{ `${invoice.receiver}` }}</v-col>
                                </v-row>
                                <v-row> 
                                    <v-col class="pa-0 pt-1 pl-3 text-caption" cols="3" sm="3">주소</v-col>
                                    <v-col class="pa-0" cols="9" sm="9">{{ `${invoice.postNo} ${invoice.address} ${invoice.addressDetail}` }}</v-col>
                                </v-row>
                                <v-row> 
                                    <v-col class="pa-0 pt-1 pl-3 text-caption" cols="3" sm="3">요청사항</v-col>
                                    <v-col class="pa-0" cols="9" sm="9">{{ invoice.memo ? invoice.memo : '-' }}</v-col>
                                </v-row>
                                <v-row> 
                                    <v-col class="pa-0 pt-1 pl-3 text-caption" cols="3" sm="3">비고</v-col>
                                    <v-col class="pa-0" cols="9" sm="9">{{ invoice.comment ? invoice.comment : '-' }}</v-col>
                                </v-row>
                            </v-container>
                        </div>
                    </v-card>
                </v-list-item>
            </v-list>
            <div class="d-flex align-center justify-center flex-no-wrap justify-space-between mb-10">
                <v-btn v-if="hasMore" class="mx-auto" @click="searchList()">더보기</v-btn>
            </div>
        </template>
    </v-container>
</template>

<style scoped>
.my-frame {
    max-width: 700px;
    margin: 0 auto;
}
.my-frame .text-caption {
    min-height: 30px;
}
.btn-wrap {
    width: 90px;
}
</style>