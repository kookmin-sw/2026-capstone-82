// ===================================================================
// Mission: Airport Money Exchange (공항 환전)
// Task: Exchange dollars to Korean won at Incheon Airport
// ===================================================================

const exchangeMission = {
  id: 'exchange',
  title: '공항 환전 — Money Exchange',
  background: 'images/Airport_cv.png',

  helperContext: `The player just arrived at Incheon International Airport.
Their goal: find the currency exchange counter (환전소) and change US dollars to Korean won (KRW).
Current exchange rate in the game: 1 USD ≈ 1,200 KRW.
The exchange counter requires showing a passport (여권).
Airport exchanges have slightly worse rates than city banks, but are convenient.
Polite speech (존댓말) is expected. Typical amounts: 100, 500, or 1000 USD.`,

  vocabulary: [
    { kr: '환전소', en: 'currency exchange counter', rom: 'hwanjeonso' },
    { kr: '환율', en: 'exchange rate', rom: 'hwanyul' },
    { kr: '여권', en: 'passport', rom: 'yeogwon' },
    { kr: '원', en: 'Korean won (KRW)', rom: 'won' },
    { kr: '달러', en: 'US dollar (USD)', rom: 'dalleo' },
    { kr: '안내원', en: 'information staff / guide', rom: 'annaewon' },
  ],

  sceneFn() {
    const scenes = {};
    const go = name => { clearChoices(); scenes[name](); };
    const enterGo = name => waitEnterThen(() => go(name));

    let ch1 = null, ch4 = null, ch5 = null, ch7 = null;

    scenes.start = () => {
      changeBackground('images/Airport_cv.png');
      typeText('공항 안내원: 어서오세요! 한국에 오신 것을 환영합니다!', () => {
        addChoice('감사합니다! 환전소를 찾고 있어요.', '1');
        addChoice('(고개를 끄덕인다)', '2');
        addChoice('(주변을 둘러본다)', '3');
        waitForChoice(v => { ch1 = v; go('step2'); });
      });
    };

    scenes.step2 = () => {
      if (ch1 === '1') {
        typeText('공항 안내원: 아, 환전이 필요하신가요? 달러를 원으로 바꾸시려고요?', () => {
          addChoice('네, 맞습니다!', '1');
          addChoice('네, 얼마나 환전할 수 있나요?', '2');
          waitForChoice(() => go('step3'));
        });
      } else if (ch1 === '2') {
        typeText('공항 안내원: 뭔가 필요하신 게 있으세요?', () => {
          addChoice('환전소를 찾고 있어요.', '1');
          addChoice('(손짓으로 환전을 표현한다)', '2');
          waitForChoice(() => go('step3'));
        });
      } else {
        typeText('공항 안내원: 뭔가 찾으시는 거 있으세요?', () => {
          addChoice('환전소가 어디 있나요?', '1');
          addChoice('(영어로 "Exchange?"라고 말한다)', '2');
          waitForChoice(() => go('step3'));
        });
      }
    };

    scenes.step3 = () => {
      typeText('공항 안내원: 환전소는 바로 저쪽입니다! 직진하다가 왼쪽으로 꺾으면 보일 거예요.', () => {
        addChoice('감사합니다! 가보겠습니다.', '1');
        addChoice('혹시 환율이 좋은가요?', '2');
        waitForChoice(() => go('step4'));
      });
    };

    scenes.step4 = () => {
      changeBackground('images/MoneyExchange.png');
      typeText('(환전소에 도착했다)\n환전소 직원: 어서오세요! 무엇을 도와드릴까요?', () => {
        addChoice('달러를 원으로 환전해 주세요.', '1');
        addChoice('환율이 어떻게 되나요?', '2');
        addChoice('(달러를 꺼낸다)', '3');
        waitForChoice(v => { ch4 = v; go('step5'); });
      });
    };

    scenes.step5 = () => {
      let text;
      if (ch4 === '1')      text = '환전소 직원: 네, 얼마를 환전해 드릴까요?';
      else if (ch4 === '2') text = '환전소 직원: 현재 환율은 1달러에 1,200원입니다. 얼마를 환전하시겠어요?';
      else                  text = '환전소 직원: 아, 달러를 환전하시려고요? 얼마를 환전해 드릴까요?';
      typeText(text, () => {
        addChoice('100달러 환전해 주세요.', '1');
        addChoice('500달러 환전해 주세요.', '2');
        addChoice('1000달러 환전해 주세요.', '3');
        waitForChoice(v => { ch5 = v; go('step6'); });
      });
    };

    scenes.step6 = () => {
      let text;
      if (ch5 === '1')      text = '환전소 직원: 100달러요? 그럼 120,000원이 됩니다.';
      else if (ch5 === '2') text = '환전소 직원: 500달러요? 그럼 600,000원이 됩니다.';
      else                  text = '환전소 직원: 1000달러요? 그럼 1,200,000원이 됩니다.';
      typeText(text, () => {
        addChoice('네, 환전해 주세요.', '1');
        addChoice('(달러를 건넨다)', '2');
        waitForChoice(() => go('step7'));
      });
    };

    scenes.step7 = () => {
      typeText('환전소 직원: 잠깐만요, 여권을 확인해야 합니다.', () => {
        addChoice('(여권을 건넨다)', '1');
        addChoice('여권이 어디 있지?', '2');
        waitForChoice(v => { ch7 = v; go('step8'); });
      });
    };

    scenes.step8 = () => {
      if (ch7 === '1') {
        typeText('환전소 직원: 감사합니다. (여권을 확인한다) 좋습니다!', () => enterGo('step9'));
      } else {
        typeText('환전소 직원: 여권이 필요합니다. 찾아오실 수 있나요?', () => {
          addChoice('(가방을 뒤진다) 여기 있습니다!', '1');
          addChoice('(당황한다)', '2');
          waitForChoice(() => go('step9'));
        });
      }
    };

    scenes.step9 = () => {
      typeText('환전소 직원: 환전을 진행하겠습니다. (계산기를 두드린다)', () => enterGo('step10'));
    };

    scenes.step10 = () => {
      typeText('환전소 직원: 환전이 완료되었습니다! (원화를 건넨다)', () => enterGo('step11'));
    };

    scenes.step11 = () => {
      typeText('주인공: 감사합니다! 정말 도움이 됐어요!', () => enterGo('step12'));
    };

    scenes.step12 = () => {
      typeText('환전소 직원: 한국 여행 즐기세요! 다시 오세요!', showMissionComplete);
    };

    go('start');
  },

  completeTitle: '💰 환전 완료!',
  completeMessage: '달러를 원으로 성공적으로 환전했습니다!'
};
