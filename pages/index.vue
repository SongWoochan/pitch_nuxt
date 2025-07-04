<script setup lang="ts">
import { useFetch } from 'nuxt/app';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { VNumberInput } from 'vuetify/labs/VNumberInput'

const runtimeConfig = useRuntimeConfig()

useHead({
	title: '다정농원 대극천 복숭아',
    meta: [
        { property:'og:image', content: `${runtimeConfig.public.DOMAIN}/img/peach_2.jpg` },
    	{ name: 'description', content: '1년동안 기다려주셔서 감사합니다. 대극천 복숭아 판매 시작합니다 😀' }
    ],
    script : [
    // 다음 주소 검색 API
        { src: '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js' },
    ],
})


const getPrice = async () => {
    const result = await $fetch('/api/pitch', {
        method: 'POST',
        body: {
            type: 'PRICE',
        }
    })

    if ((result as any)?.code === 200) {
        const price = (result as any)?.result
        return {
            price3kg : price.price3kg,
            price2kg : price.price2kg
        }
    } else {
        alert ((result as any)?.message ?? 'fail...')
        return {
            price3kg : 0,
            price2kg : 0
        }
    }
}

const priceRes = await getPrice()

const price3kg = ref(priceRes.price3kg || Number(runtimeConfig.public.PRICE_3KG ?? 0))
const price2kg = ref(priceRes.price2kg ||Number(runtimeConfig.public.PRICE_2KG ?? 0))

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
    datetime: string
}

const data = ref<Invoice>({
    name: '',
    receiver: '',
    phoneNo: '',
    postNo: '',
    address: '',
    addressDetail: '',
    memo: '',
    count: 0,
    count2: 0,
    datetime: '',
})

const resetData = () => {
    data.value.name = ''
    data.value.receiver = ''
    data.value.phoneNo = ''
    data.value.postNo = ''
    data.value.address = ''
    data.value.addressDetail = ''
    data.value.memo = ''
    data.value.count = 0
    data.value.count2 = 0
    data.value.datetime = ''

    isSameName.value = true
}

const STORAGE_KEY = 'orderList';
const orderList = ref<Array<Invoice>>([])
function addOrder(item: Invoice) {
  orderList.value.unshift(JSON.parse(JSON.stringify(item)));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orderList.value));
}

const showForm = ref(false)

const changShowForm = (isShow: boolean) => {
    showForm.value = isShow
}

const isLoading = ref(false)

const isValid = (): boolean => {
    if (!data.value.name) {
        alert('받는사람의 이름을 입력해주세요.')
        return false
    }
    if (!data.value.phoneNo) {
        alert('받는사람의 전화번호를 입력해주세요.')
        return false
    }
    if (!data.value.postNo) {
        alert('주소를 입력해주세요.')
        return false
    }
    return true
}

const apiCall = async () => {
    if (!isValid()) {
        return
    }

    if (!confirm('입력한 정보로 주문하시겠습니까?')){
        return
    }

    isLoading.value = true

    const { data: result } = await useFetch('/api/pitch', {
        method: 'POST',
        body: { ...(data.value), type: 'ADD' }
    })

    console.log('result.value?.code', result.value?.code)
    console.log('result.value?.message', result.value?.message)

    if (result.value?.code === 200) {
        alert(result.value?.message || '정상처리되었습니다.\n이용해주셔서 감사합니다!')
        data.value.datetime = formatNow()
        addOrder(data.value)
        resetData()
        changShowForm(false)
    } else {
        alert('오류가 발생하였습니다.\n잠시 후 다시 시도해주세요.')
    }
    
    isLoading.value = false
}

const cancel = () => {
    resetData()
    changShowForm(false)
}

const insertAddress = (zipCode: string, addr: string, extraAddr: string) => {
    data.value.address = `${addr} ${extraAddr}` 
    // data.value.addressDetail = extraAddr
    data.value.postNo = zipCode
}

const addrSearch = () => {
    new daum.Postcode({
        oncomplete: function(data: any) {
        // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

        // 각 주소의 노출 규칙에 따라 주소를 조합한다.
        // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
        let addr = ''; // 주소 변수
        let extraAddr = ''; // 참고항목 변수

        //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
            addr = data.roadAddress;
        } else { // 사용자가 지번 주소를 선택했을 경우(J)
            addr = data.jibunAddress;
        }

        // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
        if(data.userSelectedType === 'R'){
            // 법정동명이 있을 경우 추가한다. (법정리는 제외)
            // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
            extraAddr += data.bname;
            }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if(data.buildingName !== '' && data.apartment === 'Y'){
            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if(extraAddr !== ''){
            extraAddr = ' (' + extraAddr + ')';
            }
            // 조합된 참고항목을 해당 필드에 넣는다.
        //   document.getElementById("sample6_extraAddress").value = extraAddr;

        } else {
        //   document.getElementById("sample6_extraAddress").value = '';
        }

        // 우편번호와 주소 정보를 해당 필드에 넣는다.
        // document.getElementById('sample6_postcode').value = data.zonecode;
        // document.getElementById("sample6_address").value = addr;
        // 커서를 상세주소 필드로 이동한다.
        // document.getElementById("sample6_detailAddress").focus();

        insertAddress(data.zonecode, addr, extraAddr)
        }
    }).open();
}

const copyToClipboard = () => {
  let textToCopy = document.getElementById("myAccount")?.textContent;

  // text area method
  let textArea = document.createElement("textarea");
  textArea.value = textToCopy ?? '';
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  return new Promise((res, rej) => {
    document.execCommand("copy") ? res(true) : rej();
    textArea.remove();
  });
}

const popImgNo = ref(0)
const imgDialog = ref(false)
const openImage = (i: number) => {
    popImgNo.value = i
    imgDialog.value = true
}

const popImgSrc = computed(() => {
    return `/img/peach/origin/${popImgNo.value ?? 0}.jpg`
})


const price3kgView = computed(() => {
    return priceFomat(price3kg.value)
})
const price2kgView = computed(() => {
    return priceFomat(price2kg.value)
})

const totalPrice = computed(() => {
    const price = (data.value.count * price3kg.value) + (data.value.count2 * price2kg.value)
    // const price = (data.value.count * price3kg.value)
    return priceFomat(price)
})

const isSameName = ref(true)

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatNow(): string {
  const now = new Date();
  const Y = now.getFullYear();
  const M = pad2(now.getMonth() + 1);    // 월은 0~11
  const D = pad2(now.getDate());
  const h = pad2(now.getHours());
  const m = pad2(now.getMinutes());
  const s = pad2(now.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}


watch(() => data.value.name, () =>{
    if (isSameName.value) {
        data.value.receiver = data.value.name
    }
})

watch(isSameName, (newValue, oldValue) => {
    console.log('newValue', newValue, oldValue)
    if (newValue) {
        data.value.receiver = data.value.name
    } else {
        data.value.receiver = ''
    }
})

const showDialog = ref(false)

onMounted(async () => {
    // 장마철 주문 중지
    showDialog.value = true
    // 장마철 주문 중지
    
    const orderListJson = localStorage.getItem(STORAGE_KEY);
    orderList.value = orderListJson ? JSON.parse(orderListJson) : [];
})

</script>
<template>
    <v-container class="my-frame pa-0">
        <v-overlay  class="d-flex align-center justify-center flex-wrap text-center" v-model="isLoading">
            <v-progress-circular indeterminate></v-progress-circular>
        </v-overlay>   
        <v-img
            :aspect-ratio="1"
            class="bg-white"
            src="/img/peach_3.jpg"
            max-height="300"
            cover
          ></v-img>
          
        <v-sheet
            class="d-flex align-center justify-center flex-wrap text-center mx-auto py-15 px-4"
            elevation="0"
            width="100%"
            rounded
        >
            <div class="mb-3">
                <h2 class="text-h4 font-weight-black text-orange mb-10 word-keep">대극천 명품 복숭아</h2>
                <div class="text-h5 font-weight-medium mb-5 word-keep">
                    직접 키운 복숭아, 정직하게 담았습니다.
                </div>
                <p class="text-body-4 mb-7 word-keep">
                    자연에 가까운 방식으로 정성껏 키운 복숭아! <br/>
                    향기 깊고, 당도 높고, 식감 좋은 복숭아만 엄선해 보내드립니다.
                </p>
                <div class="mb-10 word-keep " style="color:black;">
                    <p><v-icon color="success">mdi-check-bold</v-icon><span style="color:orange;">당일 수확</span>, <span style="color:green;">산지 직송</span></p>
                    <p><v-icon color="success">mdi-check-bold</v-icon> <span style="color:green;">단단</span>하고 <span style="color:orange;">아삭아삭</span>한 복숭아🍑</p>
                    <p><v-icon color="success">mdi-check-bold</v-icon> 당도 측정기로 확인한 평균 <span style="color:orange;">16브릭스</span></p>
                    <p><v-icon color="success">mdi-check-bold</v-icon> 화순 로컬푸드직매장 납품 복숭아</p>
                    <p><span><v-icon color="success">mdi-check-bold</v-icon> 크기 선별</span> - 2kg : 중소과 기준 (12~16과)</p>
                    <p><span style="visibility: hidden;"><v-icon color="success">mdi-check-bold</v-icon> 크기 선별</span> - 3kg : 중소과 기준 (17~23과)</p>
                    <p><v-icon color="success">mdi-check-bold</v-icon> 선물용 & 가정용 모두 추천드립니다!</p>
                    <p class="text-body-4 my-5">
                        <span class="font-weight-medium">2kg {{ price2kgView }}원</span> (상자 당 택배비 포함가격) <br/>
                        <span class="font-weight-medium">3kg {{ price3kgView }}원</span> (상자 당 택배비 포함가격) <br/>
                        아래 "<span style="color:orange;">배송정보 입력하기</span>"를 눌러 배송지를 보내주세요 ☺️
                    </p>
                </div>
                <div class="mb-10 word-keep" style="color:black;">
                    <p>📦 2kg, 3kg 단위 구매 가능</p>
                    <p>🚚 우체국 택배 선착순 발송<br/>(주문 물량 많을 시 다음날 발송)</p>
                    <p>📢 2kg, 3kg 박스 디자인이 다르니 참고 바랍니다🙏</p>
                </div>
                <div class="mb-10 word-keep" style="color:black;">
                    <p>
                        <v-btn variant="outlined" prepend-icon="mdi-message-text-outline">
                            <a href="https://open.kakao.com/me/dajung_peach" target="_blank">카카오톡 채널</a>
                            <!-- <v-icon icon="mdi-gesture-tap" size="large"></v-icon> -->
                        </v-btn> 로 문의<v-icon icon="mdi-gesture-tap" size="large"></v-icon> 주세요!
                    </p>
                </div>
                <v-btn v-if="!showForm" color="orange" variant="text"  size="x-large" border @click="changShowForm(true)">배송정보 입력하기</v-btn>
            </div>
            <template v-if="showForm">
                <v-divider></v-divider>
                <v-form @submit.prevent class="w-100 mx-4 my-10">
                    <v-container>
                        <v-row> 
                            <v-col class="pa-0" cols="12" sm="12">
                                <v-text-field v-model="data.name" label="성함(입금자)" variant="outlined"  density="comfortable" @submit.prevent/>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="12" sm="12">
                                <v-text-field v-model="data.phoneNo" label="전화번호" type="tel" variant="outlined" density="comfortable"/>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0 pb-5 d-flex align-center justify-center flex-wrap text-center " cols="4" sm="4">
                                <v-field-label class="">수량(2kg 박스)</v-field-label>
                            </v-col>
                            <v-col class="pa-0" cols="8" sm="8">
                                <v-number-input variant="outlined" control-variant="split" v-model="data.count2" :min="0" :max="20" density="comfortable" ></v-number-input>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0 pb-5 d-flex align-center justify-center flex-wrap text-center " cols="4" sm="4">
                                <v-field-label class="">수량(3kg 박스)</v-field-label>
                            </v-col>
                            <v-col class="pa-0" cols="8" sm="8">
                                <v-number-input variant="outlined" control-variant="split" v-model="data.count" :min="0" :max="20" density="comfortable" ></v-number-input>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0 pt-5 pb-5 d-flex align-end justify-end flex-wrap text-right " cols="12" sm="12">
                                <v-field-label class="">총 {{ totalPrice }} 원</v-field-label>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="6" sm="6">
                                <v-text-field v-model="data.receiver" label="받는사람" variant="outlined"  density="comfortable" :disabled="isSameName" @submit.prevent/>
                            </v-col>
                            <v-col class="pa-0" cols="6" sm="6">
                                <v-checkbox label="입금자와 동일" v-model="isSameName" color="success"></v-checkbox>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="6" sm="6">
                                <v-text-field v-model="data.postNo" label="우편번호" variant="outlined" density="comfortable" disabled/>
                            </v-col>
                            <v-col class="pa-0 pb-5 d-flex align-center justify-end flex-wrap text-center " cols="6" sm="6">
                                <v-btn color="gray" elevated variant="tonal" size="large" @click="addrSearch" @submit.prevent>
                                    <v-icon
                                    icon="mdi-magnify"
                                    start
                                    ></v-icon>
                                    주소검색
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="12" sm="12">
                                <v-text-field v-model="data.address" label="주소" variant="outlined" density="comfortable" disabled/>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="12" sm="12">
                                <v-text-field v-model="data.addressDetail" label="상세주소" clearable variant="outlined" density="comfortable"/>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="12" sm="12">
                                <v-textarea label="배송 요청사항 (우체국 택배 기입용)" variant="outlined" 
                                    placeholder="ex) 문 앞에 놔주세요." density="comfortable"
                                    v-model="data.memo"
                                ></v-textarea>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-btn class="mt-2" color="primary" elevated size="x-large" type="button" variant="tonal" block @click="apiCall">주문하기</v-btn>
                </v-form>
                <v-divider></v-divider>
            </template>
        </v-sheet>
        <v-card
            variant="outlined"
            class="mx-auto mb-10"
            color="surface-variant"
            width="95%"
            subtitle="입금계좌"
        >   
            <v-card-item>
            <div>
                <div class="text-h7 mb-1">
                    카카오뱅크
                </div>
                <div class="text-h7 mb-1">
                    <span class="mr-4">노수빈</span>|<span class="ml-4" id="myAccount">3333-28-4825104</span>
                    <v-icon class="ml-4" icon="mdi-content-copy" @click="copyToClipboard"></v-icon>
                </div>
            </div>
            </v-card-item>
        </v-card>
        <div class="mb-3 mt-3" v-if="orderList.length > 0">
            <p class="text-body-4  pl-4 word-keep">📜접수내역</p>
            <div class="px-5 pt-5 word-keep " style="color:gray;"
                v-for="order  in orderList" :key="order.datetime">
                <p>접수일시 : {{ order.datetime }}</p>
                <p>받는사람 : {{ `${order.name}`}} <v-if :is="order.count > 0">| {{` 2kg x ${order.count2} 박스` }}</v-if> <v-if :is="order.count > 0">| {{` 3kg x ${order.count} 박스` }}</v-if></p>
                <p>주소 : {{ `${order.address} ${order.addressDetail}` }}</p>
                <v-divider class="mt-3"></v-divider>
            </div>
        </div>
        <v-divider class="my-10"></v-divider>
        <v-expansion-panels class="mb-10">
            <v-expansion-panel>
                <template #title>
                    <v-icon start class="me-2">mdi-image-multiple</v-icon>
                    다정농원 갤러리
                </template>
                <template #text>
                    <v-container fluid>
                        <v-row dense>
                            <v-col
                                v-for="n in 11"
                                :key="n"
                                cols="6"
                                sm="4"
                            >
                            <v-img
                                :src="`/img/peach/${n-1}.jpg`"
                                aspect-ratio="1"
                                class="rounded-sm elevation-2"
                                cover
                                @click="openImage(n-1)"
                                style="cursor: pointer"
                            ></v-img>
                            </v-col>
                        </v-row>
                    </v-container>
                </template>
            </v-expansion-panel>
        </v-expansion-panels>
        <!-- <v-carousel 
            cycle
            color="grey-darken-4"
            hide-delimiters
            :hide-delimiter-background="true"
            :interval="5000"
        >
            <v-carousel-item
                v-for="n in 7"
                :key="n"
                :src="`/img/peach/${n-1}.jpg`"
                :aspect-ratio="1.2"
                color="grey-darken-3"
            ></v-carousel-item>
        </v-carousel> -->
    </v-container>
    <v-dialog
      v-model="showDialog"
      width="auto"
    >
      <v-card
        max-width="400"
        prepend-icon="mdi-alert-circle-outline"
        title="공지사항"
        text="물량이 거의 소진되어 추가 주문은 카카오채널로 문의 부탁드립니다."
      >
        <template v-slot:actions>
          <v-btn
            class="ms-auto"
            text="Ok"
            @click="showDialog = false"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>
    <!-- 이미지 팝업 -->
    <!-- <v-dialog v-model="imgDialog" max-width="800">
        <v-card>
            <v-img :src="popImgSrc" aspect-ratio="16/9" cover></v-img>
        </v-card>
    </v-dialog> -->
    <v-dialog v-model="imgDialog" max-width="1000" scrollable>
        <v-card
            class="pa-0"
            style="max-height: 90vh; overflow: auto;"
        >
        <div
            style="
            touch-action: manipulation;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            max-height: 90vh;
            background-color: black;
            "
        >
            <img
                :src="popImgSrc"
                style="max-width: 100%; max-height: 90vh;"
                alt="확대 이미지"
                @click="imgDialog = false"
            />
        </div>
        </v-card>
    </v-dialog>
</template>


<style scoped>
.my-frame {
    max-width: 700px;
    margin: 0 auto;
}

.word-keep {
    word-break: keep-all;
}

</style>