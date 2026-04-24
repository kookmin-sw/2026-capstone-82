// ===================================================================
// Mission: Lost and Found (분실물 센터)
// Task: Find a lost phone at the airport lost and found center
// ===================================================================

const lostfoundMission = {
  id: 'lostfound',
  title: '분실물 센터 — Lost and Found',
  background: 'images/LostAndFound.png',

  helperContext: `The player lost their phone at the airport and must retrieve it from the Lost and Found center (분실물 센터).
At Korean Lost and Found, you must:
1. Describe the lost item (model, color, case, distinctive marks)
2. State where and when you lost it
3. Show your passport or ID for verification
4. Sign a receipt form when you collect the item
Staff expect polite speech (존댓말). If the item isn't there, they'll ask you to check back later.`,

  steps: {
    start: {
      text: '분실물 센터 직원: 안녕하세요. 무엇을 도와드릴까요?',
      choices: [
        { label: '휴대폰을 잃어버렸어요.', next: 'askDetails' },
        { label: '분실물을 찾으러 왔습니다.', next: 'askDetails' }
      ]
    },

    askDetails: {
      text: '직원: 어디서, 언제 잃어버리셨나요?',
      choices: [
        { label: '한 시간 전에 게이트 근처에서요.', next: 'askPhone' },
        { label: '화장실에 두고 나온 것 같아요.', next: 'askPhone' }
      ]
    },

    askPhone: {
      text: '직원: 휴대폰 모델과 색깔을 알려주시겠어요?',
      choices: [
        { label: '아이폰 15, 검정색이에요.', next: 'searching' },
        { label: '갤럭시 S24, 흰색이에요.', next: 'searching' }
      ]
    },

    searching: {
      text: '직원: 잠시만요, 확인해볼게요. (컴퓨터를 확인한다)',
      choices: [
        { label: '(기다린다)', next: 'found' }
      ]
    },

    found: {
      text: '직원: 아, 찾았습니다! 여권을 보여주시겠어요?',
      choices: [
        { label: '(여권을 건넨다)', next: 'sign' }
      ]
    },

    sign: {
      text: '직원: 확인되었습니다. 여기 서명해 주세요.',
      choices: [
        { label: '(서명한다)', next: 'receive' }
      ]
    },

    receive: {
      text: '직원: 여기 휴대폰입니다. 다음부터는 조심하세요!',
      choices: [
        { label: '감사합니다! 정말 다행이에요.', next: 'done' }
      ]
    },

    done: {
      text: '직원: 안녕히 가세요!',
      choices: [
        { label: '[미션 완료] 메뉴로 돌아가기', next: 'END' }
      ]
    }
  },

  completeTitle: '📱 휴대폰 찾기 완료!',
  completeMessage: '분실물 센터에서 휴대폰을 무사히 찾았습니다!'
};
