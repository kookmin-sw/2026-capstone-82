// ===================================================================
// Mission: Immigration Registration (출입국관리사무소)
// Task: Apply for an Alien Registration Card (ARC) at the immigration office
// ===================================================================

const immigrationMission = {
  id: 'immigration',
  title: '출입국관리사무소 — Immigration Office',
  background: 'images/Information_desk.png',

  helperContext: `The player is at a Korean Immigration Office (출입국관리사무소) to apply for an Alien Registration Card (외국인등록증, ARC).
Foreigners staying in Korea longer than 90 days MUST get an ARC within 90 days of arrival.
Required documents vary by visa type:
- D-2 (student): 통합신청서, passport + copy, photo (3.5x4.5cm white bg), proof of address, enrollment certificate + tuition receipt, 60,000 KRW cash
- E-series (work): same base docs + employment contract + business registration copy
- D-4 (language student): same base docs + admission letter + tuition receipt
The application form (통합신청서 별지 제34호) is available at Hikorea (www.hikorea.go.kr).
Fee is 60,000 KRW cash only. Card arrives in 3–4 weeks by mail or in-person pickup.`,

  vocabulary: [
    { kr: '출입국관리사무소', en: 'immigration office', rom: 'churipguk gwanri samusso' },
    { kr: '외국인 등록증', en: 'Alien Registration Card (ARC)', rom: 'oegugin deungnokjeung' },
    { kr: '통합신청서', en: 'integrated application form', rom: 'tonghap sincheongseo' },
    { kr: '번호표', en: 'queue number ticket', rom: 'beonhopyo' },
    { kr: '창구', en: 'service counter / window', rom: 'changgu' },
    { kr: '수수료', en: 'fee / service charge', rom: 'susuryo' },
    { kr: '체류 자격', en: 'residence status / visa category', rom: 'cheryu jagyeok' },
  ],

  images: ['images/Information_desk.png', 'images/Immigration_waiting.png', 'images/Immigration_RegDesk.png'],

  sceneFn() {
    const scenes = {};
    const go = name => { clearChoices(); scenes[name](); };
    const enterGo = name => waitEnterThen(() => go(name));

    let ch2 = null, ch3 = null, ch4 = null, ch5 = null;
    let ch8 = null, ch15 = null, chPickup = null;

    // ================================================================
    // PART 1 — 안내 데스크 (Information Desk)
    // ================================================================

    scenes.start = () => {
      changeBackground('images/Information_desk.png');
      typeText('주인공: 출입국관리사무소에 도착했다!\n안내 데스크에 가보자.', () => enterGo('step2'));
    };

    scenes.step2 = () => {
      typeText('안내원: 안녕하세요! 무엇을 도와드릴까요?', () => {
        addChoice('외국인 등록을 하러 왔습니다.', '1');
        addChoice('외국인 등록증 발급이 가능한가요?', '2');
        waitForChoice(v => { ch2 = v; go('step3'); });
      });
    };

    scenes.step3 = () => {
      let intro = ch2 === '1'
        ? '안내원: 외국인 등록이요! 체류 자격이 어떻게 되세요?'
        : '안내원: 네, 가능합니다! 입국일로부터 90일 이내에 신청하셔야 해요.\n체류 자격이 어떻게 되세요?';
      typeText(intro, () => {
        addChoice('유학생입니다. (D-2 비자)', '1');
        addChoice('취업 비자입니다. (E-시리즈)', '2');
        addChoice('어학연수생입니다. (D-4 비자)', '3');
        waitForChoice(v => { ch3 = v; go('step4'); });
      });
    };

    scenes.step4 = () => {
      const docs = {
        '1': '안내원: D-2 유학 비자시군요! 필요한 서류를 안내해 드릴게요.\n\n📋 통합신청서 (별지 제34호 서식)\n📕 여권 원본 및 인적사항면 사본\n📷 컬러 사진 1매 (3.5x4.5cm, 흰 배경)\n🏠 체류지 입증 서류\n📄 재학증명서 + 등록금 납입증명서\n💰 수수료 60,000원 (현금만 가능)',
        '2': '안내원: E-시리즈 취업 비자시군요! 필요한 서류를 안내해 드릴게요.\n\n📋 통합신청서 (별지 제34호 서식)\n📕 여권 원본 및 인적사항면 사본\n📷 컬러 사진 1매 (3.5x4.5cm, 흰 배경)\n🏠 체류지 입증 서류\n📄 고용계약서 + 사업자등록증 사본\n💰 수수료 60,000원 (현금만 가능)',
        '3': '안내원: D-4 어학연수 비자시군요! 필요한 서류를 안내해 드릴게요.\n\n📋 통합신청서 (별지 제34호 서식)\n📕 여권 원본 및 인적사항면 사본\n📷 컬러 사진 1매 (3.5x4.5cm, 흰 배경)\n🏠 체류지 입증 서류\n📄 표준입학허가서 + 등록금 납입증명서\n💰 수수료 60,000원 (현금만 가능)',
      };
      typeText(docs[ch3], () => {
        addChoice('네, 다 준비했습니다!', '1');
        addChoice('통합신청서는 어디서 받나요?', '2');
        waitForChoice(v => { ch4 = v; go('step5'); });
      });
    };

    scenes.step5 = () => {
      if (ch4 === '2') {
        typeText('안내원: 하이코리아(Hikorea) 사이트에서 다운로드할 수 있어요!\n미리 작성해 오셨나요?', () => {
          addChoice('네, 작성해 왔습니다!', '1');
          addChoice('아직 안 했는데요...', '2');
          waitForChoice(v => { ch5 = v; go('step6'); });
        });
      } else {
        typeText('안내원: 좋습니다! 서류가 다 준비되셨군요.\n그럼 제가 대기표를 뽑아 드릴게요!', () => enterGo('step7'));
      }
    };

    scenes.step6 = () => {
      if (ch5 === '2') {
        typeText('안내원: 괜찮아요! 저쪽에 작성 공간이 있으니 작성하고 오세요.\n(잠시 후 작성 완료)\n안내원: 좋습니다! 그럼 대기표를 뽑아 드릴게요!', () => enterGo('step7'));
      } else {
        typeText('안내원: 좋습니다! 그럼 대기표를 뽑아 드릴게요!', () => enterGo('step7'));
      }
    };

    // ================================================================
    // PART 2 — 대기 (Waiting)
    // ================================================================

    scenes.step7 = () => {
      changeBackground('images/Immigration_waiting.png');
      typeText('안내원: 여기 대기표입니다. 🎫\n번호가 호출되면 창구로 가세요!', () => {
        addChoice('감사합니다! (대기표를 받는다)', '1');
        addChoice('(대기표를 받으며 고개를 끄덕인다)', '2');
        waitForChoice(() => go('step8'));
      });
    };

    scenes.step8 = () => {
      typeText('(자리에 앉아 기다리는 중...)\n(주변에 다른 외국인들도 대기하고 있다)', () => {
        addChoice('(조용히 기다린다)', '1');
        addChoice('(서류를 다시 한번 확인한다)', '2');
        waitForChoice(v => { ch8 = v; go('step9'); });
      });
    };

    scenes.step9 = () => {
      let text = ch8 === '2'
        ? '(서류를 다시 확인한다... 통합신청서, 여권, 사진, 체류지 서류... 다 있다!)'
        : '(조용히 기다리는 중... 전광판의 번호가 바뀌고 있다)';
      typeText(text, () => enterGo('step10'));
    };

    scenes.step10 = () => {
      typeText('📢 "다음 번호, 창구 3번으로 오세요!"\n\n주인공: 아, 내 번호다!', () => {
        addChoice('(서류를 챙겨 창구로 간다)', '1');
        addChoice('(서둘러 일어난다)', '2');
        waitForChoice(() => go('step11'));
      });
    };

    // ================================================================
    // PART 3 — 서류 제출 창구 (Submission Counter)
    // ================================================================

    scenes.step11 = () => {
      changeBackground('images/Immigration_RegDesk.png');
      typeText('담당 직원: 안녕하세요. 외국인 등록 신청이시죠?\n서류를 제출해 주세요.', () => {
        addChoice('(서류를 건넨다)', '1');
        addChoice('네, 여기 있습니다!', '2');
        waitForChoice(() => go('step12'));
      });
    };

    scenes.step12 = () => {
      typeText('담당 직원: (서류를 확인한다)\n📋 통합신청서... ✅\n📕 여권 원본 및 사본... ✅', () => enterGo('step13'));
    };

    scenes.step13 = () => {
      typeText('담당 직원: 📷 컬러 사진 (3.5x4.5cm, 흰 배경)... ✅\n🏠 체류지 입증 서류... ✅', () => enterGo('step14'));
    };

    scenes.step14 = () => {
      typeText('담당 직원: 📄 체류 자격별 추가 서류... ✅\n모든 서류가 확인되었습니다!', () => enterGo('step15'));
    };

    scenes.step15 = () => {
      typeText('담당 직원: 수수료 60,000원을 납부해 주세요.\n현금만 가능합니다.', () => {
        addChoice('(60,000원을 건넨다)', '1');
        addChoice('카드로 안 되나요?', '2');
        waitForChoice(v => { ch15 = v; go('step16'); });
      });
    };

    scenes.step16 = () => {
      if (ch15 === '1') {
        typeText('담당 직원: 수수료 납부 완료! ✅', () => enterGo('pickupChoice'));
      } else {
        typeText('담당 직원: 죄송합니다, 현금만 가능해요.\n저쪽에 ATM이 있으니 현금을 인출해 오세요!', () => {
          addChoice('(ATM에서 현금을 인출해 온다)', '1');
          addChoice('(주머니를 뒤진다) 아, 현금이 있었네요!', '2');
          waitForChoice(() => go('step17'));
        });
      }
    };

    scenes.step17 = () => {
      typeText('담당 직원: 수수료 납부 완료! ✅', () => enterGo('pickupChoice'));
    };

    scenes.pickupChoice = () => {
      typeText('담당 직원: 외국인 등록증은 약 3~4주 후에 발급됩니다.\n수령 방법을 선택해 주세요.', () => {
        addChoice('직접 방문해서 수령하겠습니다.', '1');
        addChoice('우편으로 받겠습니다. (비용 별도)', '2');
        waitForChoice(v => { chPickup = v; go('pickupConfirm'); });
      });
    };

    scenes.pickupConfirm = () => {
      if (chPickup === '1') {
        typeText('담당 직원: 네, 3~4주 후에 직접 방문해 주세요!\n접수증을 꼭 보관하세요.', () => enterGo('final'));
      } else {
        typeText('담당 직원: 네, 우편으로 보내드리겠습니다.\n등기우편 비용이 별도로 발생합니다.', () => enterGo('final'));
      }
    };

    scenes.final = () => {
      typeText('담당 직원: 외국인 등록 신청이 완료되었습니다! 수고하셨어요!\n주인공: 감사합니다! 정말 도움이 많이 됐어요!', showMissionComplete);
    };

    go('start');
  },

  completeTitle: '🏛️ 외국인 등록 완료!',
  completeMessage: '외국인 등록 신청을 성공적으로 완료했습니다!'
};
