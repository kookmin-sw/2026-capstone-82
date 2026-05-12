// ===================================================================
// Mission: Lost and Found (분실물 센터)
// Task: Find a lost phone at the airport lost and found center
// ===================================================================

const lostfoundMission = {
  id: 'lostfound',
  title: '분실물 센터 — Lost and Found',
  background: 'images/Airport_cv.webp',

  helperContext: `The player lost their phone at the airport and must retrieve it from the Lost and Found center (분실물 센터).
At Korean Lost and Found, you must:
1. Describe the lost item (model, color, case, distinctive marks)
2. State where and when you lost it
3. Show your passport or ID for verification
4. Sign a receipt form when you collect the item
Staff expect polite speech (존댓말). If the item isn't there, they'll ask you to check back later.`,

  vocabulary: [
    { kr: '분실물 센터', en: 'lost and found center', rom: 'bunsilmul senteo' },
    { kr: '휴대폰', en: 'mobile phone / smartphone', rom: 'hyudaepon' },
    { kr: '잃어버리다', en: 'to lose (something)', rom: 'ireobŏrida' },
    { kr: '여권', en: 'passport', rom: 'yeogwon' },
    { kr: '신분증', en: 'ID card', rom: 'sinbunjeung' },
    { kr: '게이트', en: 'airport gate', rom: 'geiteu' },
  ],

  images: ['images/Airport_cv.webp', 'images/LostAndFound.webp'],

  sceneFn() {
    const scenes = {};
    const go = name => { clearChoices(); scenes[name](); };
    const enterGo = name => waitEnterThen(() => go(name));

    let ch1 = null, ch4 = null, ch7 = null, ch8 = null;

    scenes.start = () => {
      changeBackground('images/Airport_cv.webp');
      typeText('주인공: 어? 휴대폰이 없네... 어디서 잃어버렸지?', () => {
        addChoice('공항 직원에게 물어본다.', '1');
        addChoice('(주변을 둘러본다)', '2');
        addChoice('(당황한다)', '3');
        waitForChoice(v => { ch1 = v; go('step2'); });
      });
    };

    scenes.step2 = () => {
      if (ch1 === '1') {
        typeText('공항 직원: 휴대폰을 잃어버리셨어요? 분실물 센터로 가보세요!', () => {
          addChoice('분실물 센터가 어디 있나요?', '1');
          addChoice('감사합니다!', '2');
          waitForChoice(() => go('step3'));
        });
      } else if (ch1 === '2') {
        typeText('(주변을 살펴본다... 휴대폰이 보이지 않는다)', () => {
          addChoice('공항 직원에게 도움을 청한다.', '1');
          addChoice('(계속 찾아본다)', '2');
          waitForChoice(() => go('step3'));
        });
      } else {
        typeText('주인공: 이럴 수가... 휴대폰이 정말 없다!', () => {
          addChoice('공항 직원을 찾는다.', '1');
          waitForChoice(() => go('step2_ask'));
        });
      }
    };

    scenes.step2_ask = () => {
      typeText('공항 직원: 안녕하세요! 무슨 일이세요? 도와드릴까요?', () => {
        addChoice('휴대폰을 잃어버렸어요!', '1');
        addChoice('분실물 센터가 어디 있나요?', '2');
        waitForChoice(() => go('step3'));
      });
    };

    scenes.step3 = () => {
      typeText('공항 직원: 분실물 센터는 저쪽 안내소 옆입니다. 직진하다가 오른쪽으로 꺾으세요!', () => {
        addChoice('감사합니다! 가보겠습니다.', '1');
        addChoice('혹시 휴대폰이 있을 확률이 높나요?', '2');
        waitForChoice(v => {
          if (v === '2') go('step3_chance');
          else go('step4');
        });
      });
    };

    scenes.step3_chance = () => {
      typeText('공항 직원: 공항에서 분실된 물건은 대부분 분실물 센터에 접수돼요.\n한번 가보시면 아마 있을 거예요!', () => {
        addChoice('알겠습니다! 가볼게요.', '1');
        waitForChoice(() => go('step4'));
      });
    };

    scenes.step4 = () => {
      changeBackground('images/LostAndFound.webp');
      typeText('(분실물 센터에 도착했다)\n분실물 센터 직원: 어서오세요! 뭔가 잃어버리셨어요?', () => {
        addChoice('네, 휴대폰을 잃어버렸어요.', '1');
        addChoice('휴대폰을 찾고 있는데요.', '2');
        addChoice('(휴대폰 사진을 보여준다)', '3');
        waitForChoice(v => { ch4 = v; go('step5'); });
      });
    };

    scenes.step5 = () => {
      if (ch4 === '3') {
        typeText('분실물 센터 직원: 아, 이 휴대폰이군요! 잠깐만요.', () => {
          addChoice('(기다린다)', '1');
          addChoice('(불안해한다)', '2');
          waitForChoice(() => go('step6'));
        });
      } else {
        typeText('분실물 센터 직원: 휴대폰이요? 어떤 휴대폰인가요?', () => {
          addChoice('검은색 아이폰입니다.', '1');
          addChoice('최신형 삼성 휴대폰입니다.', '2');
          addChoice('(휴대폰 모델을 설명한다)', '3');
          waitForChoice(() => go('step6'));
        });
      }
    };

    scenes.step6 = () => {
      typeText('분실물 센터 직원: (컴퓨터를 확인한다) 네, 저희가 가지고 있습니다!', () => {
        addChoice('정말요? 감사합니다!', '1');
        addChoice('(안도의 한숨을 쉰다)', '2');
        waitForChoice(() => go('step7'));
      });
    };

    scenes.step7 = () => {
      typeText('분실물 센터 직원: 신분증을 확인해야 합니다.', () => {
        addChoice('(신분증을 건넨다)', '1');
        addChoice('신분증이 어디 있지?', '2');
        waitForChoice(v => { ch7 = v; go('step8'); });
      });
    };

    scenes.step8 = () => {
      if (ch7 === '1') {
        typeText('분실물 센터 직원: 감사합니다. (신분증을 확인한다) 좋습니다!', () => enterGo('step9'));
      } else {
        typeText('분실물 센터 직원: 신분증이 필요합니다. 찾아오실 수 있나요?', () => {
          addChoice('(가방을 뒤진다) 여기 있습니다!', '1');
          addChoice('(당황한다)', '2');
          waitForChoice(v => { ch8 = v; go('step9'); });
        });
      }
    };

    scenes.step9 = () => {
      if (ch8 === '2') {
        typeText('분실물 센터 직원: 괜찮습니다. 천천히 찾으세요.', () => {
          addChoice('(신분증을 찾는다) 여기 있습니다!', '1');
          waitForChoice(() => go('step9_verify'));
        });
      } else {
        typeText('분실물 센터 직원: (뒤에서 휴대폰을 꺼낸다) 여기 있습니다!', () => enterGo('step10'));
      }
    };

    scenes.step9_verify = () => {
      typeText('분실물 센터 직원: 감사합니다. (신분증을 확인한다)\n확인 완료! ✅\n\n(뒤에서 휴대폰을 꺼낸다) 여기 있습니다!', () => enterGo('step10'));
    };

    scenes.step10 = () => {
      typeText('주인공: 오! 정말 내 휴대폰이다!', () => enterGo('step11'));
    };

    scenes.step11 = () => {
      typeText('분실물 센터 직원: 다행이네요! 앞으로 조심하세요!', () => enterGo('step12'));
    };

    scenes.step12 = () => {
      typeText('주인공: 정말 감사합니다! 도움이 많이 됐어요!', showMissionComplete);
    };

    go('start');
  },

  completeTitle: '📱 휴대폰 찾기 완료!',
  completeMessage: '분실물 센터에서 휴대폰을 무사히 찾았습니다!'
};
