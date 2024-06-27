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

    isSameName.value = true
}

const showForm = ref(false)

const changShowForm = (isShow: boolean) => {

    // 장마철 주문 중지
    // showDialog.value = true
    // return
    // 장마철 주문 중지

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
    // 장마철 주문 중지
    // showDialog.value = true
    // return
    // 장마철 주문 중지

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
        alert('정상처리되었습니다.\n이용해주셔서 감사합니다!')
        // router.push('/')
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
const showPopImg = ref(false)
const openImage = (i: number) => {
    popImgNo.value = i
    showPopImg.value = true
}

const popImgSrc = computed(() => {
    console.log(`/img/peach/${popImgNo.value ?? 0}.jpg`)
    return `/img/peach/${popImgNo.value ?? 0}.jpg`
})

const totalPrice = computed(() => {
    const price = (data.value.count * price3kg) + (data.value.count2 * price2kg)
    return priceFomat(price)
})

const isSameName = ref(true)

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

onMounted(() => {
    // 장마철 주문 중지
    // showDialog.value = true
    // 장마철 주문 중지
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
                <h2 class="text-h4 font-weight-black text-orange mb-10 word-keep">다정농원 대극천 복숭아</h2>
                <div class="text-h5 font-weight-medium mb-5 word-keep">
                    1년동안 기다려주셔서 감사합니다.<br/> 대극천 복숭아 판매 시작합니다. 😀
                </div>
                <p class="text-body-4 mb-7">
                    3kg {{ priceFomat(price3kg) }}원 (상자 당 택배비 포함가격) <br/>
                    2kg {{ priceFomat(price2kg) }}원 (상자 당 택배비 포함가격) <br/>
                    아래 '배송정보 입력하기'를 눌러 배송지를 보내주세요~!
                </p>
                <div class="mb-10 word-keep" style="color:gray;">
                    <p>1. 배송은 입금 순으로 순차적으로 발송됩니다.</p>
                    <p>2. 당일수확, 당일배송을 원칙으로 합니다.</p>
                    <p>3. 금요일은 택배발송을 하지않습니다.<br/> ( 유통 과정에서 후숙되어 상할 수 있기 때문)</p>
                    <p>4. 금,토,일 주문 건은 월요일에 순차적으로 발송됩니다.</p>
                    <p>5. 발송 전 주문취소 건 및 기타 문의 사항은<br/> 
                        <v-btn variant="outlined" append-icon="mdi-gesture-tap">
                            <a href="https://open.kakao.com/me/dajung_peach" target="_blank">카카오톡 문의</a>
                            <!-- <v-icon icon="mdi-gesture-tap" size="large"></v-icon> -->
                        </v-btn> 로 연락바랍니다.</p>
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
                                <v-field-label class="">수량(3kg 박스)</v-field-label>
                            </v-col>
                            <v-col class="pa-0" cols="8" sm="8">
                                <v-number-input variant="outlined" control-variant="split" v-model="data.count" :min="0" :max="20" density="comfortable" ></v-number-input>
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
                                >{{ data.memo }}</v-textarea>
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
                    농협
                </div>
                <div class="text-h7 mb-1">
                    <span class="mr-4">노영식</span>|<span class="ml-4" id="myAccount">601052-52-128758</span>
                    <v-icon class="ml-4" icon="mdi-content-copy" @click="copyToClipboard"></v-icon>
                </div>
            </div>
            </v-card-item>
        </v-card>
        <v-divider class="my-10"></v-divider>
        <v-carousel 
            cycle
            color="grey-darken-4"
            hide-delimiters
            :hide-delimiter-background="true"
            :interval="5000"
        >
            <v-carousel-item
                v-for="n in 8"
                :key="n"
                :src="`/img/peach/${n-1}.jpg`"
                :aspect-ratio="1.2"
                color="grey-darken-3"
            ></v-carousel-item>
        </v-carousel>
    </v-container>
    <v-dialog
      v-model="showDialog"
      width="auto"
    >
      <v-card
        max-width="400"
        prepend-icon="mdi-alert-circle-outline"
        title="공지사항"
        text="장마가 지나가면 주문을 재개할 예정이에요. 조금만 기다려주세요."
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