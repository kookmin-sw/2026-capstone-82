// ===================================================================
// Mission: Airport Money Exchange (공항 환전)
// Task: Exchange dollars to Korean won at Incheon Airport
// ===================================================================

const exchangeMission = {
  id: 'exchange',
  title: '공항 환전 — Money Exchange',
  background: 'images/Airport.png',

  helperContext: `The player just arrived at Incheon International Airport.
Their goal: find the currency exchange counter (환전소) and change US dollars to Korean won (KRW).
Current exchange rate in the game: 1 USD ≈ 1,200 KRW.
The exchange counter requires showing a passport (여권).
Airport exchanges have slightly worse rates than city banks, but are convenient.
Polite speech (존댓말) is expected. Typical amounts: 100, 500, or 1000 USD.`,

  steps: {
    start: {
      text: '공항 안내원: 어서오세요! 한국에 오신 것을 환영합니다!',
      choices: [
        { label: '감사합니다! 환전소를 찾고 있어요.', next: 'directions' },
        { label: '(주변을 둘러본다)', next: 'lookAround' }
      ]
    },

    directions: {
      text: '공항 안내원: 환전소는 바로 저쪽입니다! 직진하다가 왼쪽으로 꺾으면 보일 거예요.',
      choices: [
        { label: '감사합니다! 가보겠습니다.', next: 'arrive' }
      ]
    },

    lookAround: {
      text: '공항 안내원: 뭔가 찾으시는 거 있으세요?',
      choices: [
        { label: '환전소가 어디 있나요?', next: 'directions' },
        { label: '(영어로 "Exchange?"라고 말한다)', next: 'directions' }
      ]
    },

    arrive: {
      text: '(환전소에 도착했다)\n환전소 직원: 어서오세요! 무엇을 도와드릴까요?',
      background: 'images/MoneyExchange.png',
      choices: [
        { label: '달러를 원으로 환전해 주세요.', next: 'askAmount' },
        { label: '환율이 어떻게 되나요?', next: 'showRate' }
      ]
    },

    showRate: {
      text: '환전소 직원: 현재 환율은 1달러에 1,200원입니다.',
      background: 'images/MoneyExchange.png',
      choices: [
        { label: '좋네요, 환전해 주세요.', next: 'askAmount' }
      ]
    },

    askAmount: {
      text: '환전소 직원: 얼마를 환전해 드릴까요?',
      background: 'images/MoneyExchange.png',
      choices: [
        { label: '100달러', next: 'confirm100' },
        { label: '500달러', next: 'confirm500' },
        { label: '1000달러', next: 'confirm1000' }
      ]
    },

    confirm100: {
      text: '환전소 직원: 100달러요? 120,000원이 됩니다. 여권을 확인해도 될까요?',
      background: 'images/MoneyExchange.png',
      choices: [
        { label: '(여권을 건넨다)', next: 'done' }
      ]
    },

    confirm500: {
      text: '환전소 직원: 500달러요? 600,000원이 됩니다. 여권을 확인해도 될까요?',
      background: 'images/MoneyExchange.png',
      choices: [
        { label: '(여권을 건넨다)', next: 'done' }
      ]
    },

    confirm1000: {
      text: '환전소 직원: 1000달러요? 1,200,000원이 됩니다. 여권을 확인해도 될까요?',
      background: 'images/MoneyExchange.png',
      choices: [
        { label: '(여권을 건넨다)', next: 'done' }
      ]
    },

    done: {
      text: '환전소 직원: 감사합니다. (계산기를 두드린다)\n환전이 완료되었습니다! 한국 여행 즐기세요!',
      background: 'images/MoneyExchange.png',
      choices: [
        { label: '[미션 완료] 메뉴로 돌아가기', next: 'END' }
      ]
    }
  },

  completeTitle: '💰 환전 완료!',
  completeMessage: '달러를 원으로 성공적으로 환전했습니다!'
};
