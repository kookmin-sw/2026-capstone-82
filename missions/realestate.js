const realestateMission = {
  id: 'realestate',
  title: '부동산 — 집 구하기',
  background: 'images/real_estate.png',
  helperContext: `The player is renting a home in Korea as a foreigner through a real estate agency (부동산).
Two rental types:
  월세 (wol-se): small deposit + monthly rent. Lower upfront cost, ongoing expense.
  전세 (jeon-se): large lump-sum deposit, no monthly rent. Returned in full at end of contract.
Required documents: 외국인 등록증 (ARC), 여권 (passport), 재직/재학증명서 (employment or enrollment proof), Korean bank account.
Important post-move-in steps:
  1. 전입신고 (move-in registration) at 주민센터 within 14 days — mandatory.
  2. 확정일자 (official date stamp) at 주민센터 — protects the deposit; costs 600 KRW.
  3. Report address change to 출입국관리사무소 (immigration office).
  4. Register automatic payment for 관리비 (maintenance fee, ~50,000–100,000 KRW/month).
중개수수료 (agent commission) applies — typically 300,000–500,000 KRW.`,
  vocabulary: [
    { kr: '월세', en: 'monthly rent (deposit + monthly payment)', rom: 'wolse' },
    { kr: '전세', en: 'lump-sum lease (large deposit, no monthly rent)', rom: 'jeonse' },
    { kr: '보증금', en: 'security deposit', rom: 'bojeunggeum' },
    { kr: '관리비', en: 'maintenance / management fee', rom: 'gwallabi' },
    { kr: '확정일자', en: 'official date stamp (protects deposit)', rom: 'hwakjeong ilja' },
    { kr: '전입신고', en: 'move-in registration', rom: 'jeonip singo' },
    { kr: '중개수수료', en: 'real estate agent commission', rom: 'junggae susuryeo' },
  ],
  completeTitle: '🏠 계약 완료!',
  completeMessage: '새로운 집을 성공적으로 구했습니다!',
  images: ['images/real_estate.png', 'images/real_estate_office.png', 'images/room_visit_A.png', 'images/room_visit_B.png'],
  sceneFn() {
    const scenes = {};
    const go = name => { clearChoices(); scenes[name](); };
    const enterGo = name => waitEnterThen(() => go(name));
    const bg = img => changeBackground('images/' + img);

    let rentType = 'monthly';
    let selectedRoom = '원룸';
    let selectedVisit = 'A';

    scenes.start = () => {
      bg('real_estate.png');
      typeText('주인공: 이제 한국에서 살 집을 구해야 해.\n부동산에 가보자!', () => enterGo('arrive'));
    };
    scenes.arrive = () => {
      bg('real_estate_office.png');
      typeText('(부동산 사무소에 도착했다)\n\n부동산 중개인: 어서오세요! 집을 찾고 계세요?', () => {
        addChoice('네, 새로 이사할 집을 찾고 있어요.', '1');
        addChoice('외국인도 집을 구할 수 있나요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('askType'); else go('foreignerOk'); });
    };
    scenes.foreignerOk = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 물론이죠! 외국인도 집을 구할 수 있어요.\n외국인 등록증과 여권이 있으시면 됩니다.\n\n어떤 형태의 집을 찾으세요?', () => {
        addChoice('월세로 찾고 있어요.', '1');
        addChoice('전세로 찾고 있어요.', '2');
        addChoice('월세와 전세의 차이가 뭔가요?', '3');
      });
      waitForChoice(c => {
        if (c === '1') { rentType = 'monthly'; go('budget'); }
        else if (c === '2') { rentType = 'jeonse'; go('budget'); }
        else go('explainTypes');
      });
    };
    scenes.askType = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 어떤 형태의 집을 찾으세요?', () => {
        addChoice('월세로 찾고 있어요.', '1');
        addChoice('전세로 찾고 있어요.', '2');
        addChoice('월세와 전세의 차이가 뭔가요?', '3');
      });
      waitForChoice(c => {
        if (c === '1') { rentType = 'monthly'; go('budget'); }
        else if (c === '2') { rentType = 'jeonse'; go('budget'); }
        else go('explainTypes');
      });
    };
    scenes.explainTypes = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 먼저 월세를 설명해 드릴게요!\n\n🏠 월세:\n• 보증금(소액) + 매달 월세를 내는 방식\n• 예: 보증금 500만원 / 월세 50만원\n• 초기 비용이 적고 매달 고정 지출이 있어요', () => enterGo('explainJeonse'));
    };
    scenes.explainJeonse = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 다음은 전세예요!\n\n🏠 전세:\n• 큰 보증금을 맡기고 월세 없이 사는 방식\n• 예: 전세금 1억원 (월세 없음)\n• 계약 종료 시 보증금 전액 돌려받아요\n• 초기 비용이 크지만 매달 지출이 없어요', () => {
        addChoice('월세로 할게요!', '1');
        addChoice('전세로 할게요!', '2');
      });
      waitForChoice(c => { rentType = c === '1' ? 'monthly' : 'jeonse'; go('budget'); });
    };
    scenes.budget = () => {
      bg('real_estate_office.png');
      if (rentType === 'monthly') {
        typeText('부동산 중개인: 월세로 찾으시는군요!\n예산이 어떻게 되세요?', () => {
          addChoice('보증금 500만원 / 월세 40~50만원', '1');
          addChoice('보증금 1000만원 / 월세 30~40만원', '2');
          addChoice('보증금 300만원 / 월세 50~60만원', '3');
        });
      } else {
        typeText('부동산 중개인: 전세로 찾으시는군요!\n전세금 예산이 어떻게 되세요?', () => {
          addChoice('1억원 정도요.', '1');
          addChoice('1억 5천만원 정도요.', '2');
          addChoice('2억원 정도요.', '3');
        });
      }
      waitForChoice(() => go('askArea'));
    };
    scenes.askArea = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 어느 지역을 선호하세요?', () => {
        addChoice('학교/직장 근처요.', '1');
        addChoice('지하철역 근처요.', '2');
        addChoice('조용한 주택가요.', '3');
      });
      waitForChoice(() => go('askRoomType'));
    };
    scenes.askRoomType = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 어떤 유형의 집을 원하세요?', () => {
        addChoice('원룸 (방 1개)', '1');
        addChoice('투룸 (방 2개)', '2');
        addChoice('오피스텔', '3');
      });
      waitForChoice(c => {
        selectedRoom = c === '1' ? '원룸' : c === '2' ? '투룸' : '오피스텔';
        go('showOptions');
      });
    };
    scenes.showOptions = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 조건에 맞는 매물을 찾아볼게요!\n\n(컴퓨터로 매물을 검색한다...)', () => enterGo('option1'));
    };
    scenes.option1 = () => {
      bg('real_estate_office.png');
      if (rentType === 'monthly') {
        typeText(`부동산 중개인: 첫 번째 매물이에요!\n\n🏠 매물 A:\n• ${selectedRoom} / 3층\n• 보증금 500만원 / 월세 45만원\n• 지하철역 도보 5분\n• 풀옵션 (에어컨, 세탁기, 냉장고)`, () => enterGo('option2'));
      } else {
        typeText(`부동산 중개인: 첫 번째 매물이에요!\n\n🏠 매물 A:\n• ${selectedRoom} / 5층\n• 전세금 1억원\n• 지하철역 도보 3분\n• 풀옵션 (에어컨, 세탁기, 냉장고)`, () => enterGo('option2'));
      }
    };
    scenes.option2 = () => {
      bg('real_estate_office.png');
      if (rentType === 'monthly') {
        typeText(`부동산 중개인: 두 번째 매물이에요!\n\n🏠 매물 B:\n• ${selectedRoom} / 7층 / 반옵션 (에어컨만)\n• 보증금 300만원 / 월세 50만원\n• 지하철역 도보 10분\n\n어떤 매물을 보러 가시겠어요?`, () => {
          addChoice('매물 A를 보고 싶어요!', '1');
          addChoice('매물 B를 보고 싶어요!', '2');
          addChoice('둘 다 보고 싶어요!', '3');
        });
      } else {
        typeText(`부동산 중개인: 두 번째 매물이에요!\n\n🏠 매물 B:\n• ${selectedRoom} / 2층 / 반옵션 (에어컨만)\n• 전세금 9000만원\n• 지하철역 도보 8분\n\n어떤 매물을 보러 가시겠어요?`, () => {
          addChoice('매물 A를 보고 싶어요!', '1');
          addChoice('매물 B를 보고 싶어요!', '2');
          addChoice('둘 다 보고 싶어요!', '3');
        });
      }
      waitForChoice(c => {
        selectedVisit = c === '2' ? 'B' : 'A';
        go('visitRoom');
      });
    };
    scenes.visitRoom = () => {
      bg(selectedVisit === 'B' ? 'room_visit_B.png' : 'room_visit_A.png');
      typeText(`(매물 ${selectedVisit}를 보러 왔다)\n\n부동산 중개인: 여기가 추천 매물이에요.\n직접 둘러보세요!`, () => {
        addChoice('(방 안을 둘러본다)', '1');
        addChoice('(창문 밖을 확인한다)', '2');
      });
      waitForChoice(() => go('checkRoom'));
    };
    scenes.checkRoom = () => {
      bg(selectedVisit === 'B' ? 'room_visit_B.png' : 'room_visit_A.png');
      typeText('(방을 꼼꼼히 확인한다)\n\n✅ 수압 확인\n✅ 곰팡이 여부 확인\n✅ 채광 확인\n✅ 소음 확인', () => enterGo('roomDecision'));
    };
    scenes.roomDecision = () => {
      bg(selectedVisit === 'B' ? 'room_visit_B.png' : 'room_visit_A.png');
      typeText('부동산 중개인: 어떠세요? 마음에 드시나요?', () => {
        addChoice('네, 여기로 할게요!', '1');
        addChoice('다른 곳도 볼 수 있나요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('contractStart'); else go('otherRoom'); });
    };
    scenes.otherRoom = () => {
      const other = selectedVisit === 'A' ? 'B' : 'A';
      selectedVisit = other;
      bg(other === 'B' ? 'room_visit_B.png' : 'room_visit_A.png');
      typeText(`부동산 중개인: 물론이죠! 다른 매물도 보여드릴게요.\n\n(매물 ${other}로 이동한다...)\n\n부동산 중개인: 여기는 어떠세요?`, () => {
        addChoice('여기가 더 좋네요! 여기로 할게요.', '1');
        addChoice('아까 본 곳이 더 나은 것 같아요.', '2');
      });
      waitForChoice(() => go('contractStart'));
    };
    scenes.contractStart = () => {
      bg(selectedVisit === 'B' ? 'room_visit_B.png' : 'room_visit_A.png');
      typeText('부동산 중개인: 좋습니다! 그럼 계약을 진행할게요.\n사무소로 돌아가서 계약서를 작성하겠습니다.', () => enterGo('contractDocs'));
    };
    scenes.contractDocs = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 계약에 필요한 서류를 확인할게요.\n\n📕 외국인 등록증 또는 여권\n📄 재직증명서 또는 재학증명서\n💰 보증금 (계약금)\n🏦 한국 은행 계좌\n\n서류를 준비하셨나요?', () => {
        addChoice('네, 다 준비했습니다!', '1');
        addChoice('어떤 서류가 필요한가요?', '2');
      });
      waitForChoice(() => go('contractExplain'));
    };
    scenes.contractExplain = () => {
      bg('real_estate_office.png');
      const deposit = rentType === 'monthly' ? '보증금 + 월세' : '전세금';
      typeText(`부동산 중개인: 계약서 내용을 설명해 드릴게요.\n\n📋 임대차 계약서:\n• 계약 기간: 1년 (또는 2년)\n• ${deposit}\n• 관리비: 별도 (약 5~10만원/월)\n• 특약사항: 원상복구 의무 등`, () => enterGo('contractWarning'));
    };
    scenes.contractWarning = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: ⚠️ 계약 시 주의사항!\n1. 확정일자를 꼭 받으세요 (주민센터, 600원)\n   → 보증금을 법적으로 보호받을 수 있어요\n2. 전입신고를 14일 이내에 하세요 (주민센터)\n3. 출입국관리사무소에 주소 변경 신고\n4. 중개 수수료가 발생합니다', () => {
        addChoice('네, 알겠습니다!', '1');
        addChoice('확정일자가 뭔가요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('signContract'); else go('explainDate'); });
    };
    scenes.explainDate = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 확정일자는 주민센터에서 받을 수 있어요.\n계약서에 날짜 도장을 찍어주는 건데,\n이걸 받으면 집주인이 보증금을 못 돌려줄 때\n법적으로 보호받을 수 있어요!\n\n비용은 600원이에요.', () => {
        addChoice('알겠습니다! 꼭 받을게요.', '1');
      });
      waitForChoice(() => go('signContract'));
    };
    scenes.signContract = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 그럼 계약서에 서명해 주세요.\n\n📋 임대차 계약서\n(내용을 꼼꼼히 읽는다...)', () => {
        addChoice('(계약서에 서명한다) ✍️', '1');
        addChoice('(한번 더 읽어본다)', '2');
      });
      waitForChoice(() => go('deposit'));
    };
    scenes.deposit = () => {
      bg('real_estate_office.png');
      const label = rentType === 'monthly' ? '보증금' : '전세금';
      typeText(`부동산 중개인: 계약서 서명 완료! ✅\n\n계약금(${label}의 10%)을 먼저 입금해 주세요.\n나머지는 입주일에 지불하시면 됩니다.`, () => {
        addChoice('(계약금을 이체한다)', '1');
      });
      waitForChoice(() => go('depositDone'));
    };
    scenes.depositDone = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 계약금 입금 확인! ✅\n\n중개 수수료 안내: 약 30~50만원 (거래 금액에 따라 다름)\n입주일에 나머지 금액과 함께 정산하겠습니다.', () => enterGo('finalAdvice'));
    };
    scenes.finalAdvice = () => {
      bg('real_estate_office.png');
      typeText('부동산 중개인: 입주 후 꼭 해야 할 것들!\n\n1️⃣ 전입신고 (14일 이내, 주민센터)\n2️⃣ 확정일자 받기 (주민센터, 600원)\n3️⃣ 출입국관리사무소 주소 변경 신고\n4️⃣ 관리비 자동이체 등록\n\n잊지 마세요!', () => {
        addChoice('네, 꼭 기억할게요!', '1');
        addChoice('메모해 둘게요!', '2');
      });
      waitForChoice(() => go('complete'));
    };
    scenes.complete = () => {
      bg('real_estate_office.png');
      const type = rentType === 'monthly' ? '월세' : '전세';
      typeText(`부동산 중개인: 계약이 완료되었습니다! 축하해요! 🎉\n주인공: 감사합니다! 드디어 한국에서 살 집이 생겼어요!\n\n💡 요약:\n• ${type} 계약 완료\n• 입주 후 전입신고 + 확정일자 필수\n• 출입국관리사무소 주소 변경 신고 필수`, showMissionComplete);
    };

    go('start');
  }
};
