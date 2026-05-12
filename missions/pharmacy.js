const pharmacyMission = {
  id: 'pharmacy',
  title: '약국에서 약 구매',
  background: 'images/pharmacy.png',
  vocabulary: [
    { kr: '약국', en: 'pharmacy', rom: 'yak-guk' },
    { kr: '처방전', en: 'prescription', rom: 'cheobangjon' },
    { kr: '일반의약품', en: 'over-the-counter medicine', rom: 'ilban uiyakpum' },
    { kr: '복용법', en: 'dosage instructions', rom: 'bok-yong-beop' },
    { kr: '식후 30분', en: '30 minutes after meals', rom: 'sikhu samsipbun' },
    { kr: '알레르기', en: 'allergy', rom: 'allereugi' },
    { kr: '해열제', en: 'fever reducer', rom: 'haeyeol-je' },
    { kr: '소화제', en: 'digestive medicine', rom: 'sohwa-je' },
  ],
  helperContext: `The player is at a Korean pharmacy (약국) to pick up medicine.
Two paths:
A) With a prescription (처방전) from a doctor: the pharmacist fills it directly; ~8,500 won with national health insurance.
B) Without prescription: describe symptoms; pharmacist recommends OTC (일반의약품) medicine; ~12,000 won.
Key dosage terms: 식후 30분 (30 min after meals), 하루 3번 (3 times a day), 하루 2번 (twice a day).
알레르기 = allergy — always check before dispensing. If buying OTC, see a doctor if symptoms persist 3+ days.`,
  completeTitle: '약 구매 완료! 💊',
  completeMessage: '약국에서 약을 성공적으로 받았습니다!',
  images: ['images/pharmacy.png', 'images/pharmacy_counter.png'],
  sceneFn() {
    const scenes = {};
    const go = name => { clearChoices(); scenes[name](); };
    const enterGo = name => waitEnterThen(() => go(name));
    const bg = img => changeBackground('images/' + img);

    let hasPrescription = false;
    let symptom = '';

    scenes.start = () => {
      bg('pharmacy.png');
      typeText('주인공: 약국에 도착했다!\n약을 사야 하는데...', () => enterGo('greet'));
    };

    scenes.greet = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 안녕하세요! 어떻게 오셨어요?', () => {
        addChoice('처방전을 가져왔어요.', '1');
        addChoice('처방전 없이 약을 사러 왔어요.', '2');
        waitForChoice(c => {
          if (c === '1') { hasPrescription = true; go('givePrescription'); }
          else { hasPrescription = false; go('noRxAskSymptom'); }
        });
      });
    };

    // ===== Path A: With prescription =====
    scenes.givePrescription = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 처방전을 보여주세요.', () => {
        addChoice('(처방전을 건넨다)', '1');
        waitForChoice(() => go('rxCheck'));
      });
    };

    scenes.rxCheck = () => {
      bg('pharmacy_counter.png');
      typeText('약사: (처방전을 확인한다)\n\n📋 처방 내용 확인 중...\n• 약 종류: 3가지\n• 복용 기간: 3일분\n\n알겠습니다! 약을 준비할게요.', () => enterGo('rxPrepare'));
    };

    scenes.rxPrepare = () => {
      bg('pharmacy_counter.png');
      typeText('(약사가 약을 조제하는 중...)\n\n약사: 잠시만 기다려 주세요.', () => enterGo('rxReady'));
    };

    scenes.rxReady = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 약이 준비되었습니다! 💊\n\n복용 방법을 안내해 드릴게요.', () => enterGo('rxExplain'));
    };

    scenes.rxExplain = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 복용 방법이에요:\n\n💊 하루 3번, 식후 30분에 드세요\n💊 3일분이니 꼭 다 드세요\n💊 졸릴 수 있으니 운전은 피하세요\n\n혹시 알레르기가 있으세요?', () => {
        addChoice('아니요, 없어요.', '1');
        addChoice('네, 페니실린 알레르기가 있어요.', '2');
        waitForChoice(c => {
          if (c === '2') go('rxAllergy');
          else go('rxPayment');
        });
      });
    };

    scenes.rxAllergy = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 확인해 볼게요...\n(처방전을 다시 확인한다)\n\n다행히 이 약에는 페니실린 성분이 없어요. ✅\n안심하고 드셔도 됩니다!', () => enterGo('rxPayment'));
    };

    scenes.rxPayment = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 약값은 총 8,500원입니다.\n(건강보험 적용 시)\n\n결제 방법을 선택해 주세요.', () => {
        addChoice('카드로 결제할게요.', '1');
        addChoice('현금으로 결제할게요.', '2');
        waitForChoice(() => go('rxPayDone'));
      });
    };

    scenes.rxPayDone = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 결제 완료! ✅\n\n여기 약이에요. (약 봉투를 건넨다)\n약 봉투에 복용법이 적혀 있으니 참고하세요!', () => enterGo('missionEnd'));
    };

    // ===== Path B: No prescription (OTC) =====
    scenes.noRxAskSymptom = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 처방전 없이 오셨군요.\n어떤 증상이 있으세요? 자세히 말씀해 주세요.', () => {
        addChoice('🤒 열이 나고 몸살 기운이 있어요.', '1');
        addChoice('🤕 머리가 아파요.', '2');
        addChoice('🤢 소화가 안 되고 속이 안 좋아요.', '3');
        addChoice('🤧 감기 기운이 있어요. 콧물, 기침.', '4');
        waitForChoice(c => {
          symptom = c;
          go('noRxDetail');
        });
      });
    };

    scenes.noRxDetail = () => {
      bg('pharmacy_counter.png');
      if (symptom === '1') {
        typeText('약사: 열이 나고 몸살이요.\n\n체온은 재보셨나요? 언제부터 그러셨어요?', () => {
          addChoice('어제부터요. 37.8도 정도예요.', '1');
          addChoice('오늘 아침부터요. 체온은 안 재봤어요.', '2');
          addChoice('3일 전부터요. 점점 심해져요.', '3');
          waitForChoice(() => go('noRxMoreQ'));
        });
      } else if (symptom === '2') {
        typeText('약사: 두통이요.\n\n어떤 식으로 아프세요?', () => {
          addChoice('한쪽만 지끈지끈 아파요.', '1');
          addChoice('머리 전체가 조이는 느낌이에요.', '2');
          addChoice('눈 뒤쪽이 욱신거려요.', '3');
          waitForChoice(() => go('noRxMoreQ'));
        });
      } else if (symptom === '3') {
        typeText('약사: 소화 불량이요.\n\n어떤 증상이 있으세요?', () => {
          addChoice('속이 더부룩하고 가스가 차요.', '1');
          addChoice('구역질이 나요.', '2');
          addChoice('설사를 해요.', '3');
          waitForChoice(() => go('noRxMoreQ'));
        });
      } else {
        typeText('약사: 감기 증상이요.\n\n어떤 증상이 가장 심하세요?', () => {
          addChoice('콧물이 계속 나요.', '1');
          addChoice('기침이 심해요.', '2');
          addChoice('목이 아프고 부었어요.', '3');
          waitForChoice(() => go('noRxMoreQ'));
        });
      }
    };

    scenes.noRxMoreQ = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 알겠습니다. 현재 복용 중인 약이 있으세요?', () => {
        addChoice('아니요, 없어요.', '1');
        addChoice('네, 비타민을 먹고 있어요.', '2');
        addChoice('네, 다른 약을 먹고 있어요.', '3');
        waitForChoice(c => {
          if (c === '3') go('noRxOtherMed');
          else go('noRxAllergy');
        });
      });
    };

    scenes.noRxOtherMed = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 어떤 약을 드시고 계세요?', () => {
        addChoice('혈압약을 먹고 있어요.', '1');
        addChoice('알레르기약을 먹고 있어요.', '2');
        addChoice('정확한 이름은 모르겠어요...', '3');
        waitForChoice(() => go('noRxAllergy'));
      });
    };

    scenes.noRxAllergy = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 알레르기가 있으세요?', () => {
        addChoice('아니요, 없어요.', '1');
        addChoice('네, 특정 약에 알레르기가 있어요.', '2');
        waitForChoice(() => go('noRxRecommend'));
      });
    };

    scenes.noRxRecommend = () => {
      bg('pharmacy_counter.png');
      let txt = '약사: 증상을 확인했어요. 추천 약을 안내해 드릴게요!\n';
      if (symptom === '1') txt += '💊 추천 약:\n• 해열제 (타이레놀 계열)\n• 종합감기약\n• 비타민C';
      else if (symptom === '2') txt += '💊 추천 약:\n• 진통제 (이부프로펜 또는 아세트아미노펜)\n• 근이완제 (어깨/목 긴장 시)';
      else if (symptom === '3') txt += '💊 추천 약:\n• 소화제 (식후 복용)\n• 정장제 (장 건강)\n• 제산제 (속쓰림 시)';
      else txt += '💊 추천 약:\n• 콧물/코막힘약\n• 기침약 (가래 동반 시)\n• 목 스프레이 (인후통 시)';
      txt += '\n이 약들로 드릴까요?';
      typeText(txt, () => {
        addChoice('네, 주세요!', '1');
        addChoice('다른 약은 없나요?', '2');
        waitForChoice(c => {
          if (c === '2') go('noRxAlternative');
          else go('noRxPrepare');
        });
      });
    };

    scenes.noRxAlternative = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 비슷한 효과의 다른 약도 있어요.\n어떤 걸 원하세요?', () => {
        addChoice('저렴한 걸로 주세요.', '1');
        addChoice('효과 좋은 걸로 주세요.', '2');
        waitForChoice(() => go('noRxPrepare'));
      });
    };

    scenes.noRxPrepare = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 알겠습니다! 약을 준비할게요.\n\n(약을 꺼내 포장하는 중...)', () => enterGo('noRxDosage'));
    };

    scenes.noRxDosage = () => {
      bg('pharmacy_counter.png');
      let txt = '약사: 복용 방법을 안내해 드릴게요.\n\n';
      if (symptom === '1') txt += '💊 해열제: 하루 3번, 식후 30분\n💊 감기약: 하루 2번, 아침/저녁\n💊 비타민C: 하루 1번';
      else if (symptom === '2') txt += '💊 진통제: 통증 있을 때 1알 (하루 최대 3번)\n💊 식후에 드세요\n⚠️ 공복에 먹지 마세요!';
      else if (symptom === '3') txt += '💊 소화제: 식후 바로 1알\n💊 정장제: 하루 3번, 식전\n💊 증상이 3일 이상 지속되면 병원에 가세요';
      else txt += '💊 콧물약: 하루 2번, 아침/저녁\n💊 기침약: 하루 3번, 식후\n💊 목 스프레이: 하루 3~4번 뿌리세요';
      typeText(txt, () => enterGo('noRxPayment'));
    };

    scenes.noRxPayment = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 약값은 총 12,000원입니다.\n(처방전 없이 구매하는 일반의약품)\n\n결제 방법을 선택해 주세요.', () => {
        addChoice('카드로 결제할게요.', '1');
        addChoice('현금으로 결제할게요.', '2');
        waitForChoice(() => go('noRxPayDone'));
      });
    };

    scenes.noRxPayDone = () => {
      bg('pharmacy_counter.png');
      typeText('약사: 결제 완료! ✅\n\n여기 약이에요. (약 봉투를 건넨다)', () => enterGo('noRxWarning'));
    };

    scenes.noRxWarning = () => {
      bg('pharmacy_counter.png');
      typeText('약사: ⚠️ 주의사항이에요!\n\n• 약을 먹고 증상이 나아지지 않으면 병원에 가세요\n• 3일 이상 복용해도 효과가 없으면 의사 상담 필요\n• 다른 약과 함께 먹을 때는 꼭 약사에게 물어보세요', () => enterGo('missionEnd'));
    };

    // ===== Complete =====
    scenes.missionEnd = () => {
      bg('pharmacy.png');
      let msg = '주인공: 약을 잘 받았다! 이제 약 먹고 푹 쉬어야지.\n\n';
      msg += '💡 요약:\n';
      if (hasPrescription) {
        msg += '• 처방전으로 빠르게 약을 받았어요\n• 식후 30분에 하루 3번 복용\n• 3일분 꼭 다 드세요!';
      } else {
        msg += '• 증상을 설명하고 일반의약품을 구매했어요\n• 복용법을 꼭 지켜주세요\n• 3일 이상 안 나으면 병원에 가세요!';
      }
      typeText(msg, showMissionComplete);
    };

    go('start');
  }
};
