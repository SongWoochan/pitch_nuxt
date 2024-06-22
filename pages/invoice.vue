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
    state: string
    regTime: string
}

const invoiceList = ref<Array<Invoice>>()

const password = ref('')

const apiCall = async () => {
    if (!password.value) {
        password.value = prompt('비밀번호를 입력해주세요.');
    }


    const { data: result } = await useFetch('/api/pitch', {
        method: 'POST',
        body: {
            type: 'LIST',
            password: password.value
        }
    })

    if ((result.value as any)?.code === 200) {

        const list = (result.value as any)?.list
        
        const resultList = []

        for (const item of (list as any).results as any) {
            resultList.push({
                name: item.properties['이름']?.title[0]?.plain_text ?? '',
                phoneNo: item.properties['전화번호']?.rich_text[0]?.plain_text ?? '',
                postNo: item.properties['우편번호']?.rich_text[0]?.plain_text ?? '',
                address: item.properties['주소']?.rich_text[0]?.plain_text ?? '',
                addressDetail: item.properties['상세주소']?.rich_text[0]?.plain_text ?? '',
                memo: item.properties['요청사항']?.rich_text[0]?.plain_text ?? '',
                count: item.properties['수량']?.number ?? '',
                state: item.properties['상태']?.select?.name ?? '',
                regTime: item.created_time?.substring(0, 19)
            })
        }


        invoiceList.value = resultList
    } else {
        alert ((result.value as any)?.message ?? 'fail...')
    }
}

</script>

<template>
    <v-container>
        <v-btn @click="apiCall">불러오기</v-btn>
        <v-list>
            <v-list-item
                v-for="(invoice, index) in invoiceList"
            >
                <v-card
                    variant="outlined"
                    class="mx-auto mb-10"
                    color="surface-variant"
                    width="95%"
                    :subtitle="invoice.phoneNo"
                    :title="invoice.name"
                >   
                    <v-card-item>
                        <v-chip v-if="invoice.state === '발송완료'" color="green" variant="flat" label>
                            발송완료
                        </v-chip>
                        <v-chip v-if="invoice.state !== '발송완료'" color="red" variant="outlined" label>
                            발송대기
                        </v-chip>
                        <div class="text-h7 mb-1">
                            <span>주소 :</span>
                            <span>{{ `${invoice.postNo} | ${invoice.address} ${invoice.addressDetail}` }}</span>
                        </div>
                        <div class="text-h7 mb-1">
                            <span>수량 :</span>
                            <span>{{ invoice.count }} 박스</span>
                        </div>
                        <div class="text-h7 mb-1">
                            <span>요청사항 (우체국 택배 기입용) :</span>
                            <span>{{ invoice.memo }} 박스</span>
                        </div>
                    </v-card-item>
                </v-card>
            </v-list-item>
        </v-list>
    </v-container>
</template>

<style scoped>
.my-frame {
    max-width: 700px;
    margin: 0 auto;
}
</style>