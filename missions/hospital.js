const hospitalMission = {
  id: 'hospital',
  title: '병원 진료 받기',
  background: 'images/hospital_lobby.webp',
  vocabulary: [
    { kr: '병원', en: 'hospital', rom: 'byeong-won' },
    { kr: '진료', en: 'medical examination', rom: 'jilryo' },
    { kr: '건강보험', en: 'national health insurance', rom: 'geongang boheom' },
    { kr: '처방전', en: 'prescription', rom: 'cheobangjon' },
    { kr: '수납', en: 'payment / cashier counter', rom: 'su-nap' },
    { kr: '외국인 등록증', en: 'Alien Registration Card (ARC)', rom: 'oegugin deungnokjeung' },
    { kr: '진단서', en: 'medical certificate', rom: 'jindanseo' },
    { kr: '증상', en: 'symptom', rom: 'jeungsang' },
  ],
  helperContext: `The player is at a Korean hospital as a foreigner seeking medical treatment.
Key rules:
- Students and workers in Korea have 건강보험 (national health insurance) — they pay ~30% of costs IF premiums are up to date.
- If insurance premiums are overdue (보험료 미납), full price applies (~45,000 won).
- Tourists pay full price (~45,000 won) unless they have 여행자보험 (travel insurance).
- After seeing the doctor they get a 처방전 (prescription) to take to a nearby pharmacy.
- An English medical certificate (영문 진단서) can be requested separately for travel insurance claims.`,
  completeTitle: '진료 완료! 🏥',
  completeMessage: '병원 진료와 처방전을 성공적으로 받았습니다!',
  images: ['images/hospital_lobby.webp', 'images/hospital_waiting.webp', 'images/hospital_doctor.webp'],
  sceneFn() {
    const scenes = {};
    const go = name => { clearChoices(); scenes[name](); };
    const enterGo = name => waitEnterThen(() => go(name));
    const bg = img => changeBackground('images/' + img);

    let visitorType = '';
    let insurancePaid = true;
    let hasTravelInsurance = false;
    let symptom = '';

    // ===== Part 1: Arrival & registration =====
    scenes.start = () => {
      bg('hospital_lobby.webp');
      typeText('주인공: 몸이 안 좋아서 병원에 왔다...\n접수 데스크에 가보자.', () => enterGo('reception'));
    };

    scenes.reception = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 안녕하세요! 어떻게 오셨어요?', () => {
        addChoice('진료를 받으러 왔습니다.', '1');
        addChoice('몸이 안 좋아서요...', '2');
        waitForChoice(() => go('askId'));
      });
    };

    scenes.askId = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 외국인이시군요! 신분증을 확인할게요.\n외국인 등록증이나 여권을 보여주세요.', () => {
        addChoice('(외국인 등록증을 건넨다)', '1');
        addChoice('(여권을 건넨다)', '2');
        waitForChoice(() => go('askVisitorType'));
      });
    };

    scenes.askVisitorType = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 한국에서의 체류 목적이 어떻게 되세요?', () => {
        addChoice('유학생입니다.', '1');
        addChoice('직장인입니다.', '2');
        addChoice('여행객입니다.', '3');
        waitForChoice(c => {
          if (c === '1') { visitorType = 'student'; go('checkInsurance'); }
          else if (c === '2') { visitorType = 'worker'; go('checkInsurance'); }
          else { visitorType = 'tourist'; go('checkTravelInsurance'); }
        });
      });
    };

    // ===== Part 2: Insurance =====
    scenes.checkInsurance = () => {
      bg('hospital_lobby.webp');
      const who = visitorType === 'student' ? '유학생' : '직장인';
      typeText(`접수 직원: ${who}이시군요!\n건강보험에 가입되어 있으시죠?\n\n⚠️ 건강보험 혜택을 받으려면 보험료 미납이 없어야 합니다.`, () => {
        addChoice('네, 건강보험 있고 미납 없어요!', '1');
        addChoice('건강보험은 있는데... 미납이 있을 수도요.', '2');
        addChoice('건강보험이 뭔가요?', '3');
        waitForChoice(c => {
          if (c === '1') { insurancePaid = true; go('insuranceOk'); }
          else if (c === '2') { insurancePaid = false; go('insuranceUnpaid'); }
          else go('explainInsurance');
        });
      });
    };

    scenes.explainInsurance = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 한국에서 유학생과 외국인 직장인은\n의무적으로 건강보험에 가입되어 있어요.\n\n건강보험이 있으면 진료비의 약 30%만 부담하면 돼요!\n단, 보험료 미납이 있으면 혜택을 받을 수 없어요.', () => {
        addChoice('아, 미납 없어요! 보험 적용해 주세요.', '1');
        addChoice('미납이 있을 수도 있어요...', '2');
        waitForChoice(c => {
          if (c === '1') { insurancePaid = true; go('insuranceOk'); }
          else { insurancePaid = false; go('insuranceUnpaid'); }
        });
      });
    };

    scenes.insuranceOk = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 건강보험 확인 완료! ✅\n보험 적용되어 진료비 할인을 받으실 수 있어요.', () => enterGo('askSymptom'));
    };

    scenes.insuranceUnpaid = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 건강보험료 미납이 확인되었습니다. ⚠️\n미납 상태에서는 보험 혜택을 받을 수 없어요.\n\n진료는 가능하지만, 전액 본인 부담이 됩니다.\n진료를 계속 진행하시겠어요?', () => {
        addChoice('네, 진행해 주세요.', '1');
        addChoice('미납 금액을 먼저 납부할 수 있나요?', '2');
        waitForChoice(c => {
          if (c === '1') go('askSymptom');
          else go('payUnpaid');
        });
      });
    };

    scenes.payUnpaid = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 미납 보험료는 국민건강보험공단에서 납부하셔야 해요.\n오늘은 전액 부담으로 진료 받으시고,\n나중에 보험료 납부 후 환급 신청하실 수 있어요.', () => {
        addChoice('알겠습니다. 진료 진행해 주세요.', '1');
        waitForChoice(() => go('askSymptom'));
      });
    };

    scenes.checkTravelInsurance = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 여행객이시군요!\n혹시 여행자 보험에 가입하셨나요?', () => {
        addChoice('네, 여행자 보험이 있어요!', '1');
        addChoice('아니요, 보험이 없어요.', '2');
        waitForChoice(c => {
          if (c === '1') { hasTravelInsurance = true; go('travelInsuranceOk'); }
          else { hasTravelInsurance = false; go('noTravelInsurance'); }
        });
      });
    };

    scenes.travelInsuranceOk = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 여행자 보험이 있으시군요!\n진료 후 영수증을 받으시면 보험사에 청구할 수 있어요.\n\n💡 영문 진단서도 필요하시면 말씀해 주세요.', () => enterGo('askSymptom'));
    };

    scenes.noTravelInsurance = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 보험이 없으시면 진료비 전액 본인 부담이에요.\n진료를 계속 진행하시겠어요?', () => {
        addChoice('네, 진행해 주세요.', '1');
        waitForChoice(() => go('askSymptom'));
      });
    };

    // ===== Part 3: Symptoms =====
    scenes.askSymptom = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 접수 완료! 어떤 증상으로 오셨나요?', () => {
        addChoice('🤒 열이 나고 기침이 나요.', '1');
        addChoice('🤕 머리가 아파요.', '2');
        addChoice('🤢 배가 아프고 속이 안 좋아요.', '3');
        addChoice('🤧 콧물이 나고 목이 아파요.', '4');
        waitForChoice(c => {
          if (c === '1') { symptom = 'fever'; go('symptomFever'); }
          else if (c === '2') { symptom = 'headache'; go('symptomHead'); }
          else if (c === '3') { symptom = 'stomach'; go('symptomStomach'); }
          else { symptom = 'cold'; go('symptomCold'); }
        });
      });
    };

    scenes.symptomFever = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 열과 기침이요. 언제부터 그러셨어요?', () => {
        addChoice('어제부터요.', '1');
        addChoice('3일 전부터요.', '2');
        addChoice('오늘 갑자기요.', '3');
        waitForChoice(() => go('waitDoctor'));
      });
    };

    scenes.symptomHead = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 두통이요. 어떤 종류의 두통인가요?', () => {
        addChoice('지끈지끈 아파요. (편두통)', '1');
        addChoice('머리 전체가 무거워요.', '2');
        addChoice('눈 뒤쪽이 아파요.', '3');
        waitForChoice(() => go('waitDoctor'));
      });
    };

    scenes.symptomStomach = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 복통이요. 다른 증상도 있으세요?', () => {
        addChoice('구토도 있어요.', '1');
        addChoice('설사를 해요.', '2');
        addChoice('속이 더부룩해요.', '3');
        waitForChoice(() => go('waitDoctor'));
      });
    };

    scenes.symptomCold = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 감기 증상이시군요. 다른 증상도 있으세요?', () => {
        addChoice('재채기도 많이 해요.', '1');
        addChoice('몸살 기운도 있어요.', '2');
        addChoice('목이 많이 부었어요.', '3');
        waitForChoice(() => go('waitDoctor'));
      });
    };

    // ===== Part 4: Waiting room & doctor =====
    scenes.waitDoctor = () => {
      bg('hospital_waiting.webp');
      typeText('접수 직원: 접수 완료! 대기실에서 기다려 주세요.\n이름이 호출되면 진료실로 들어가세요.', () => {
        addChoice('(대기실에 앉는다)', '1');
        waitForChoice(() => go('waiting'));
      });
    };

    scenes.waiting = () => {
      bg('hospital_waiting.webp');
      typeText('(대기실에서 기다리는 중...)\n\n📢 "다음 환자분, 진료실 2번으로 들어와 주세요!"', () => {
        addChoice('(진료실로 들어간다)', '1');
        waitForChoice(() => go('doctorGreet'));
      });
    };

    scenes.doctorGreet = () => {
      bg('hospital_doctor.webp');
      typeText('의사: 안녕하세요. 어디가 불편하세요?', () => {
        if (symptom === 'fever') addChoice('열이 나고 기침이 나요.', '1');
        else if (symptom === 'headache') addChoice('머리가 많이 아파요.', '1');
        else if (symptom === 'stomach') addChoice('배가 아프고 속이 안 좋아요.', '1');
        else addChoice('콧물이 나고 목이 아파요.', '1');
        waitForChoice(() => go('doctorExamine'));
      });
    };

    scenes.doctorExamine = () => {
      bg('hospital_doctor.webp');
      let txt = '의사: 한번 확인해 볼게요.\n\n';
      if (symptom === 'fever') txt += '(체온을 측정한다... 38.2도)\n(청진기로 폐 소리를 듣는다)\n(목 안을 확인한다)';
      else if (symptom === 'headache') txt += '(혈압을 측정한다)\n(눈동자 반응을 확인한다)\n(목과 어깨를 확인한다)';
      else if (symptom === 'stomach') txt += '(배를 눌러본다)\n(체온을 측정한다)\n(최근 식사를 확인한다)';
      else txt += '(목 안을 확인한다)\n(림프절을 만져본다)\n(체온을 측정한다)';
      typeText(txt, () => enterGo('doctorDiagnosis'));
    };

    scenes.doctorDiagnosis = () => {
      bg('hospital_doctor.webp');
      let txt = '의사: ';
      if (symptom === 'fever') txt += '상기도 감염(감기)으로 보입니다.\n열이 좀 있으니 해열제와 기침약을 처방해 드릴게요.';
      else if (symptom === 'headache') txt += '긴장성 두통으로 보입니다.\n진통제와 근이완제를 처방해 드릴게요.\n스트레스를 줄이시는 게 좋아요.';
      else if (symptom === 'stomach') txt += '급성 위장염으로 보입니다.\n소화제와 정장제를 처방해 드릴게요.\n당분간 자극적인 음식은 피하세요.';
      else txt += '감기로 인한 비염 증상이에요.\n콧물약과 목 염증약을 처방해 드릴게요.';
      typeText(txt, () => enterGo('doctorAdvice'));
    };

    scenes.doctorAdvice = () => {
      bg('hospital_doctor.webp');
      typeText('의사: 약은 3일분 처방해 드릴게요.\n처방전을 가지고 약국에 가시면 됩니다.\n\n충분히 쉬시고, 물 많이 드세요!\n증상이 나아지지 않으면 다시 오세요.', () => {
        addChoice('감사합니다, 의사 선생님!', '1');
        addChoice('영문 진단서도 받을 수 있나요?', '2');
        waitForChoice(c => {
          if (c === '2') go('englishCert');
          else go('payment');
        });
      });
    };

    scenes.englishCert = () => {
      bg('hospital_doctor.webp');
      typeText('의사: 네, 영문 진단서는 접수 데스크에서 신청하시면 돼요.\n발급 비용이 별도로 있습니다. (약 5,000~10,000원)', () => {
        addChoice('알겠습니다. 감사합니다!', '1');
        waitForChoice(() => go('payment'));
      });
    };

    // ===== Part 5: Payment & prescription =====
    scenes.payment = () => {
      bg('hospital_lobby.webp');
      let txt = '접수 직원: 진료가 끝나셨군요! 수납을 도와드릴게요.\n\n';
      if (visitorType === 'tourist') {
        txt += hasTravelInsurance
          ? '💰 진료비: 45,000원 (보험 미적용, 전액 본인 부담)\n\n💡 영수증을 보관하시면 여행자 보험으로 청구 가능해요!'
          : '💰 진료비: 45,000원 (보험 미적용, 전액 본인 부담)';
      } else if (!insurancePaid) {
        txt += '💰 진료비: 45,000원 (보험 미납으로 전액 본인 부담)\n\n⚠️ 보험료 납부 후 환급 신청이 가능합니다.';
      } else {
        txt += '💰 진료비: 15,000원 (건강보험 적용, 본인 부담 30%)\n\n✅ 건강보험 혜택이 적용되었습니다!';
      }
      typeText(txt, () => {
        addChoice('(수납한다)', '1');
        waitForChoice(() => go('paymentDone'));
      });
    };

    scenes.paymentDone = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 수납 완료! ✅\n\n여기 처방전이에요. 📋\n가까운 약국에 가시면 약을 받으실 수 있어요.', () => enterGo('prescription'));
    };

    scenes.prescription = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 처방전 안내:\n📋 처방 내용:\n• 약 종류: 3가지\n• 복용 기간: 3일\n• 복용 방법: 하루 3번, 식후 30분\n\n약국은 병원 바로 옆에 있어요!', () => {
        addChoice('감사합니다! 약국에 가볼게요.', '1');
        addChoice('영수증도 주세요. (보험 청구용)', '2');
        waitForChoice(c => {
          if (c === '2') go('getReceipt');
          else go('missionEnd');
        });
      });
    };

    scenes.getReceipt = () => {
      bg('hospital_lobby.webp');
      typeText('접수 직원: 여기 영수증이에요! 📄\n보험사에 청구하실 때 필요하니 잘 보관하세요.', () => enterGo('missionEnd'));
    };

    scenes.missionEnd = () => {
      bg('hospital_lobby.webp');
      let msg = '주인공: 진료도 받고 처방전도 받았다!\n이제 약국에 가서 약을 타면 되겠다.\n\n';
      msg += '💡 요약:\n';
      if (visitorType === 'tourist') {
        msg += hasTravelInsurance
          ? '• 여행자 보험으로 진료비 청구 가능\n• 영수증 꼭 보관하세요!'
          : '• 보험 없이 전액 부담\n• 다음엔 여행자 보험 가입을 추천!';
      } else {
        msg += insurancePaid
          ? '• 건강보험 적용으로 30%만 부담\n• 보험료 미납 없이 유지하세요!'
          : '• 보험료 미납으로 전액 부담\n• 보험료 납부 후 환급 신청 가능!';
      }
      msg += '\n• 처방전을 가지고 약국에서 약을 받으세요';
      typeText(msg, showMissionComplete);
    };

    go('start');
  }
};
