// ===================================================================
// Mission: Convenience Store (편의점)
// Task: Buy and recharge a T-money card at a Korean convenience store
// ===================================================================

const convstoreMission = {
  id: 'convstore',
  title: '편의점 — Convenience Store',
  background: 'images/ConvStoreInside.png',

  // Context passed to the AI helper chatbot
  helperContext: `The player is in a Korean convenience store (편의점 / CU).
Their goal: buy a T-money transportation card (교통카드) and recharge it.
In Korea, you can buy T-money at any convenience store (CU, GS25, 7-Eleven, Mini Stop).
A blank T-money card costs 2,000-4,000 KRW.
After buying, you can recharge (충전) at the counter with cash — typically 5,000-10,000 KRW to start.
Polite speech (존댓말) is expected when speaking to the clerk.`,

  // Dialog flow: each step returns { text, choices, background, isEnd }
  // 'choices' is an array of { label, nextStep } — if empty, press Enter to advance
  steps: {
    start: {
      text: '편의점 사장: 안녕하세요!',
      choices: [
        { label: '안녕하세요!', next: 'friendly' },
        { label: '앗… 네… (고개만 끄떡)', next: 'shy' },
        { label: '(무시하고 둘러본다)', next: 'ignore' }
      ]
    },

    friendly: {
      text: '편의점 사장: 오늘 날씨 좋네요!',
      choices: [
        { label: '네, 정말요!', next: 'askCard' },
        { label: '그럼요, 산책 나왔어요.', next: 'askCard' }
      ]
    },

    shy: {
      text: '편의점 사장: 괜찮으세요? 뭔가 찾으시는 거 있으세요?',
      choices: [
        { label: '교통 카드 있나요?', next: 'showCard' },
        { label: '아직 둘러보는 중이에요.', next: 'browse' }
      ]
    },

    ignore: {
      text: '편의점 사장: 어? 뭔가 찾으시는 거 있으세요?',
      choices: [
        { label: '아, 네! 교통 카드 있나요?', next: 'showCard' },
        { label: '그냥 둘러보고 있어요.', next: 'browse' }
      ]
    },

    askCard: {
      text: '편의점 사장: 그런데 혹시 교통 카드 필요하신가요?',
      choices: [
        { label: '아, 맞다! 필요했어요.', next: 'showCard' },
        { label: '아니요, 이미 있어요.', next: 'browse' }
      ]
    },

    browse: {
      text: '편의점 사장: 그럼 천천히 보세요. 저는 여기 있으니까요!',
      choices: [
        { label: '(갑자기 생각난다) 아! 카드!', next: 'showCard' },
        { label: '교통 카드 주세요.', next: 'showCard' }
      ]
    },

    showCard: {
      text: '편의점 사장: 네! 여기 있습니다. 요즘 많이 사가세요!',
      choices: [
        { label: '얼마예요?', next: 'price' },
        { label: '충전도 가능한가요?', next: 'price' }
      ]
    },

    price: {
      text: '편의점 사장: 카드는 2000원입니다. 충전도 여기서 바로 해드려요!',
      choices: [
        { label: '5000원 충전해 주세요.', next: 'charge5000' },
        { label: '10000원 충전해 주세요.', next: 'charge10000' }
      ]
    },

    charge5000: {
      text: '(5000원을 건넸다)\n편의점 사장: 충전 완료! 카드 2000원 + 충전 3000원 사용 가능합니다.',
      choices: [
        { label: '감사합니다!', next: 'goodbye' }
      ]
    },

    charge10000: {
      text: '(10000원을 건넸다)\n편의점 사장: 충전 완료! 카드 2000원 + 충전 8000원 사용 가능합니다.',
      choices: [
        { label: '감사합니다!', next: 'goodbye' }
      ]
    },

    goodbye: {
      text: '편의점 사장: 안녕히 가세요! 좋은 하루 되세요!',
      choices: [
        { label: '[미션 완료] 메뉴로 돌아가기', next: 'END' }
      ]
    }
  },

  // Popup shown when mission is complete
  completeTitle: '🎉 미션 완료!',
  completeMessage: '교통 카드 구매 및 충전 완료!'
};
