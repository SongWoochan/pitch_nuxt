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
}

const data = ref<Invoice>({
    name: '',
    phoneNo: '',
    postNo: '',
    address: '',
    addressDetail: '',
    memo: '',
    count: 1,
})

const resetData = () => {
    data.value.name = ''
    data.value.phoneNo = ''
    data.value.postNo = ''
    data.value.address = ''
    data.value.addressDetail = ''
    data.value.memo = ''
    data.value.count = 0
}

const showForm = ref(false)

const changShowForm = (isShow: boolean) => {
    showForm.value = isShow
}

const isLoading = ref(false)

const apiCall = async () => {
    isLoading.value = true

    const { data: result } = await useFetch('/api/pitch', {
        method: 'POST',
        body: data.value
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

const insertAddress = (zipCode: string, addr: string, extraAddr: string) => {
    data.value.address = addr
    data.value.addressDetail = extraAddr
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

</script>
<template>
    <v-main>
        <v-overlay  class="d-flex align-center justify-center flex-wrap text-center" v-model="isLoading">
            <v-progress-circular indeterminate></v-progress-circular>
        </v-overlay>   
        <v-img
            :aspect-ratio="1"
            class="bg-white"
            src="/img/pitch_1.jpg"
            max-height="250"
            cover
          ></v-img>
          
        <v-sheet
            class="d-flex align-center justify-center flex-wrap text-center mx-auto py-15 px-4"
            elevation="4"
            width="100%"
            rounded
        >
            <div class="mb-3">
                <h2 class="text-h4 font-weight-black text-orange mb-10">다정농원 대극천 복숭아</h2>
                <div class="text-h5 font-weight-medium mb-5">
                    1년동안 기다려주셔서 감사합니다. 대극천 복숭아 판매 시작합니다 😀
                </div>
                <p class="text-body-4 mb-7">
                    3kg 35,000 (택배비 포함가격) <br/>
                    아래 배송정보 입력하기를 눌러 배송지를 보내주세요~!
                </p>
                <v-btn v-if="!showForm" color="orange" variant="text"  size="x-large" border @click="changShowForm(true)">배송지 정보 입력하기</v-btn>
            </div>
            <template v-if="showForm">
                <v-form @submit.prevent class="w-100 mx-4 mb-10">
                    <v-container>
                        <v-row> 
                            <v-col class="pa-0" cols="12" sm="12">
                                <v-text-field v-model="data.name" label="받는사람" clearable variant="outlined" @submit.prevent/>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="12" sm="12">
                                <v-text-field v-model="data.phoneNo" label="전화번호" clearable variant="outlined"/>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="12" sm="3">
                                <v-text-field v-model="data.count" label="수량" variant="outlined"/>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="6" sm="6">
                                <v-text-field v-model="data.postNo" label="우편번호" clearable variant="outlined" disabled/>
                            </v-col>
                            <v-col class="pa-0" cols="3" sm="3">
                                <v-btn color="gray" variant="text" size="x-large" border @click="addrSearch" @submit.prevent>검색</v-btn>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="12" sm="12">
                                <v-text-field v-model="data.address" label="주소" clearable variant="outlined" disabled/>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="12" sm="12">
                                <v-text-field v-model="data.addressDetail" label="상세주소" clearable variant="outlined"/>
                            </v-col>
                        </v-row>
                        <v-row> 
                            <v-col class="pa-0" cols="12" sm="12">
                                <v-textarea label="배송 요청사항" variant="outlined" >{{ data.memo }}</v-textarea>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-btn class="mt-2" size="x-large" type="submit" block @click="apiCall">저장</v-btn>
                </v-form>
            </template>
        </v-sheet>
    </v-main>
</template>