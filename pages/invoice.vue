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
    count: 0,
})

const apiCall = async () => {
    const { data: result } = await useFetch('/api/pitch', {
        method: 'POST',
        body: data.value
    })

    console.log('date', result.value?.code)
    console.log('date', result.value?.message)

    if (result.value?.code === 200) {
        alert('success!')
        // router.push('/')
    } else {
        alert ('fail...')
    }
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
    <div>
        <table>
            <tr>
                <td>성명</td>
                <td><input type="text" v-model="data.name"></td>
            </tr>
            <tr>
                <td>전화번호</td>
                <td><input type="text" v-model="data.phoneNo"></td>
            </tr>
            <tr>
                <td>수량</td>
                <td>
                    <v-text-field v-model="data.count" ></v-text-field>
                </td>
            </tr>
            <tr>
                <td>주소 검색</td>
                <td><v-btn label="주소 검색" icon="pi pi-check" /></td>
            </tr>
            <tr>
                <td>우편번호</td>
                <td><input type="text" disabled v-model="data.postNo"></td>
            </tr>
            <tr>
                <td>주소</td>
                <td><input type="text" disabled v-model="data.address"></td>
            </tr>
            <tr>
                <td>상세주소</td>
                <td><input type="text" v-model="data.addressDetail"></td>
            </tr>
            <tr>
                <td>요청사항</td>
                <td><v-textarea label="Label">{{ data.memo }}</v-textarea></td>
            </tr>
        </table>
    </div>
    <div>
        <button @click="apiCall">
            주소보내기
        </button>
        <NuxtLink to="/">
            돌아가기
        </NuxtLink>
    </div>
</template>