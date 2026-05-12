const bankMission = {
  id: 'bank',
  title: '은행 통장 개설',
  background: 'images/bank_informationdesk.png',
  helperContext: `The player is opening a Korean bank account as a foreigner.
Required documents: 외국인 등록증 (Alien Registration Card / ARC) and 여권 (passport).
With passport only, you can open a basic account but cannot get a 체크카드 (debit card).
Workers need: 재직증명서/근로계약서/급여명세서 (employment proof).
Students need: 재학증명서 or 입학허가서 (enrollment/admission proof).
Workers must also provide 납세자번호 (taxpayer ID — your home-country tax number and Korean tax number).
Account types: 입출금 통장 (checking/current account), 적금 통장 (savings account).
Debit card (체크카드) requires ARC — passport only is not enough.`,
  vocabulary: [
    { kr: '통장 개설', en: 'opening a bank account', rom: 'tongjan gaeseol' },
    { kr: '외국인 등록증', en: 'Alien Registration Card (ARC)', rom: 'oegugin deungnokjeung' },
    { kr: '여권', en: 'passport', rom: 'yeogwon' },
    { kr: '입출금 통장', en: 'checking / current account', rom: 'ipchulgeum tongjan' },
    { kr: '적금 통장', en: 'savings account', rom: 'jeokgeum tongjan' },
    { kr: '체크카드', en: 'debit card', rom: 'chekeu kada' },
    { kr: '납세자번호', en: 'taxpayer identification number', rom: 'napsejajabon-ho' },
    { kr: '대기표', en: 'queue ticket', rom: 'daegipyo' },
  ],
  completeTitle: '🏦 통장 개설 완료!',
  completeMessage: '은행 통장이 성공적으로 개설되었습니다!',
  images: ['images/bank_informationdesk.png', 'images/bank_waiting.png', 'images/bank_counter.png'],
  sceneFn() {
    const scenes = {};
    const go = name => { clearChoices(); scenes[name](); };
    const enterGo = name => waitEnterThen(() => go(name));
    const bg = img => changeBackground('images/' + img);

    let hasARC = true;
    let isWorker = true;

    scenes.arrive = () => {
      bg('bank_informationdesk.png');
      typeText('주인공: 은행에 도착했다!\n통장을 개설해야 하는데... 안내 데스크에 가보자.', () => enterGo('greet'));
    };
    scenes.greet = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 안녕하세요! 무엇을 도와드릴까요?', () => {
        addChoice('통장 개설을 하러 왔습니다.', '1');
        addChoice('외국인도 통장 개설이 가능한가요?', '2');
      });
      waitForChoice(c => {
        if (c === '2') go('foreignerOk');
        else go('askDocReady');
      });
    };
    scenes.foreignerOk = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 네, 물론 가능합니다!\n외국인 등록증이나 여권이 있으시면 돼요.\n신분증은 준비하셨나요?', () => {
        addChoice('네, 준비했습니다!', '1');
        addChoice('어떤 서류가 필요한가요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('askIdType'); else go('docInfo'); });
    };
    scenes.askDocReady = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 통장 개설이요! 신분증은 준비하셨나요?', () => {
        addChoice('네, 준비했습니다!', '1');
        addChoice('어떤 신분증이 필요한가요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('askIdType'); else go('docInfo'); });
    };
    scenes.docInfo = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 필요한 서류를 안내해 드릴게요!\n\n📕 외국인 등록증 또는 여권\n⚠️ 여권만 있으면 통장 개설은 가능하지만\n   체크카드는 외국인 등록증이 있어야 발급돼요!\n\n계좌 목적에 따라 추가 서류도 필요합니다.', () => {
        addChoice('네, 확인했습니다!', '1');
        addChoice('추가 서류가 뭔가요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('askIdType'); else go('extraDocInfo'); });
    };
    scenes.extraDocInfo = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 계좌 목적에 따라 달라요.\n\n💼 직장인: 재직증명서, 근로계약서, 급여명세서 중 하나\n🎓 학생: 재학증명서 또는 입학허가서', () => {
        addChoice('알겠습니다!', '1');
      });
      waitForChoice(() => go('askIdType'));
    };
    scenes.askIdType = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 어떤 신분증을 가져오셨나요?', () => {
        addChoice('외국인 등록증과 여권 둘 다 가져왔습니다.', '1');
        addChoice('여권만 가져왔습니다.', '2');
      });
      waitForChoice(c => {
        if (c === '1') { hasARC = true; go('askJobType'); }
        else { hasARC = false; go('passportWarning'); }
      });
    };
    scenes.passportWarning = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 여권만 있으시군요.\n통장 개설은 가능하지만, 체크카드는 외국인 등록증이 있어야 발급돼요.\n⚠️ 참고해 주세요!', () => enterGo('askJobType'));
    };
    scenes.askJobType = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 직장인이세요, 학생이세요?', () => {
        addChoice('직장인입니다.', '1');
        addChoice('학생입니다.', '2');
      });
      waitForChoice(c => {
        if (c === '1') { isWorker = true; go('askWorkerDocs'); }
        else { isWorker = false; go('askStudentDocs'); }
      });
    };
    scenes.askWorkerDocs = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 직장인이시군요!\n재직증명서, 근로계약서, 급여명세서 중 하나를 가져오셨나요?', () => {
        addChoice('재직증명서 가져왔습니다!', '1');
        addChoice('근로계약서 가져왔습니다!', '2');
        addChoice('급여명세서 가져왔습니다!', '3');
      });
      waitForChoice(() => go('workerNote'));
    };
    scenes.workerNote = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 좋습니다! 서류가 다 준비되셨네요.\n\n⚠️ 참고사항:\n• 여권상 영문 이름과 외국인등록증 이름이 일치해야 해요\n• 본국 및 한국 납세자번호를 알고 계셔야 해요', () => {
        addChoice('네, 알겠습니다!', '1');
        addChoice('납세자번호가 뭔가요?', '2');
      });
      waitForChoice(c => { if (c === '2') go('taxIdInfo'); else go('getTicket'); });
    };
    scenes.taxIdInfo = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 납세자번호는 세금 관련 고유 번호예요.\n본국에서 발급받은 번호와 한국에서 발급받은 번호가 있으면\n둘 다 알려주셔야 해요.\n\n그럼 대기표를 뽑아 드릴게요!', () => enterGo('getTicket'));
    };
    scenes.askStudentDocs = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 학생이시군요!\n재학증명서 또는 입학허가서를 가져오셨나요?', () => {
        addChoice('재학증명서 가져왔습니다!', '1');
        addChoice('입학허가서 가져왔습니다!', '2');
      });
      waitForChoice(() => go('studentNote'));
    };
    scenes.studentNote = () => {
      bg('bank_informationdesk.png');
      typeText('은행 안내원: 좋습니다! 서류가 다 준비되셨네요.\n\n⚠️ 참고사항:\n• 여권상 영문 이름과 외국인등록증 이름이 일치해야 해요', () => {
        addChoice('네, 알겠습니다!', '1');
      });
      waitForChoice(() => go('getTicket'));
    };
    scenes.getTicket = () => {
      bg('bank_waiting.png');
      typeText('은행 안내원: 여기 대기표입니다. 🎫\n번호가 호출되면 창구로 가세요!', () => {
        addChoice('감사합니다! (대기표를 받는다)', '1');
        addChoice('(대기표를 받으며 고개를 끄덕인다)', '2');
      });
      waitForChoice(() => go('waiting'));
    };
    scenes.waiting = () => {
      bg('bank_waiting.png');
      typeText('(자리에 앉아 기다리는 중...)\n(은행 안에 다른 고객들도 대기하고 있다)', () => {
        addChoice('(조용히 기다린다)', '1');
        addChoice('(서류를 다시 한번 확인한다)', '2');
      });
      waitForChoice(c => { if (c === '2') go('checkDocs'); else go('ticketCalled'); });
    };
    scenes.checkDocs = () => {
      bg('bank_waiting.png');
      typeText('(서류를 다시 확인한다... 신분증, 추가 서류... 다 있다!)', () => enterGo('ticketCalled'));
    };
    scenes.ticketCalled = () => {
      bg('bank_waiting.png');
      typeText('📢 "다음 번호, 2번 창구로 오세요!"\n\n주인공: 아, 내 번호다!', () => {
        addChoice('(서류를 챙겨 창구로 간다)', '1');
        addChoice('(서둘러 일어난다)', '2');
      });
      waitForChoice(() => go('counter'));
    };
    scenes.counter = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 안녕하세요. 통장 개설이시죠?\n신분증과 서류를 제출해 주세요.', () => {
        addChoice('(서류를 건넨다)', '1');
        addChoice('네, 여기 있습니다!', '2');
      });
      waitForChoice(() => go('verifyDocs'));
    };
    scenes.verifyDocs = () => {
      bg('bank_counter.png');
      typeText('은행 직원: (서류를 확인한다)\n📕 신분증 확인... ✅\n📄 계좌 목적 증빙 서류... ✅', () => enterGo('verifyName'));
    };
    scenes.verifyName = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 영문 이름을 확인할게요.\n여권과 외국인등록증의 이름이 일치하는지 확인 중...', () => enterGo(isWorker ? 'taxCheck' : 'selectAccount'));
    };
    scenes.taxCheck = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 영문 이름 일치 확인! ✅\n납세자번호도 확인할게요.', () => {
        addChoice('(납세자번호를 알려준다)', '1');
        addChoice('본국 번호와 한국 번호 둘 다 알려드릴게요.', '2');
      });
      waitForChoice(() => go('taxDone'));
    };
    scenes.taxDone = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 납세자번호 확인 완료! ✅\n\n이제 계좌 종류를 선택해 주세요.', () => {
        addChoice('입출금 통장 (자유입출금)', '1');
        addChoice('적금 통장 (저축용)', '2');
      });
      waitForChoice(c => go(c === '1' ? 'checkingDesc' : 'savingsDesc'));
    };
    scenes.selectAccount = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 영문 이름 일치 확인! ✅\n학생이시니 납세자번호는 따로 확인하지 않아도 돼요.\n\n이제 계좌 종류를 선택해 주세요.', () => {
        addChoice('입출금 통장 (자유입출금)', '1');
        addChoice('적금 통장 (저축용)', '2');
      });
      waitForChoice(c => go(c === '1' ? 'checkingDesc' : 'savingsDesc'));
    };
    scenes.checkingDesc = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 입출금 통장이요! 좋습니다.\n급여 이체나 생활비 관리에 편리해요.', () => enterGo('setPassword'));
    };
    scenes.savingsDesc = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 적금 통장이요! 좋은 선택이에요.\n매달 일정 금액을 저축할 수 있어요.', () => enterGo('setPassword'));
    };
    scenes.setPassword = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 비밀번호 4자리를 설정해 주세요.\n(키패드를 건넨다)', () => {
        addChoice('(비밀번호를 입력한다)', '1');
        addChoice('(신중하게 비밀번호를 설정한다)', '2');
      });
      waitForChoice(() => go('accountCreated'));
    };
    scenes.accountCreated = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 비밀번호 설정 완료! ✅\n통장이 개설되었습니다! 🎉\n\n(통장을 건넨다)', () => enterGo('debitCard'));
    };
    scenes.debitCard = () => {
      bg('bank_counter.png');
      if (!hasARC) {
        typeText('은행 직원: 통장은 개설되었지만,\n체크카드는 외국인 등록증이 있어야 발급 가능해요.\n⚠️ 외국인 등록증을 발급받으신 후 다시 방문해 주세요!', () => enterGo('complete'));
      } else {
        typeText('은행 직원: 체크카드도 함께 발급해 드릴까요?', () => {
          addChoice('네, 발급해 주세요!', '1');
          addChoice('아니요, 통장만 있으면 됩니다.', '2');
        });
        waitForChoice(c => { if (c === '1') go('debitDelivery'); else go('noDebit'); });
      }
    };
    scenes.debitDelivery = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 체크카드는 약 1~2주 후에 발급됩니다.\n우편으로 받으시겠어요, 직접 수령하시겠어요?', () => {
        addChoice('직접 수령하겠습니다.', '1');
        addChoice('우편으로 받겠습니다.', '2');
      });
      waitForChoice(c => go(c === '1' ? 'pickupDebit' : 'mailDebit'));
    };
    scenes.pickupDebit = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 네, 1~2주 후에 직접 방문해 주세요!', () => enterGo('complete'));
    };
    scenes.mailDebit = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 네, 등록하신 주소로 우편 발송해 드리겠습니다!', () => enterGo('complete'));
    };
    scenes.noDebit = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 알겠습니다! 통장만 발급해 드렸어요.\n나중에 체크카드가 필요하시면 언제든 방문해 주세요!', () => enterGo('complete'));
    };
    scenes.complete = () => {
      bg('bank_counter.png');
      typeText('은행 직원: 통장 개설이 완료되었습니다! 수고하셨어요!\n주인공: 감사합니다! 정말 도움이 많이 됐어요!', showMissionComplete);
    };

    go('arrive');
  }
};
