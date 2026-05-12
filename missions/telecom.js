const telecomMission = {
  id: 'telecom',
  title: '통신사 유심 개통',
  background: 'images/telecom_arrive.webp',
  helperContext: `The player is activating a Korean USIM (SIM card) at a phone carrier store.
Foreigners staying more than 90 days must have their 외국인 등록증 (Alien Registration Card).
Required documents: 외국인 등록증 (ARC), 여권 (passport), Korean bank account for automatic payment (자동이체).
Rate plans available: basic (기본 / 30,000 KRW / 3GB), mid (중간 / 50,000 KRW / 10GB), unlimited (무제한 / 70,000 KRW).
The contract is no-commitment (무약정) — cancellable any time with no penalty.
Two consent documents to sign: 개인정보 제공 동의서 (privacy consent) and 통신 서비스 가입 계약서 (service contract).`,
  vocabulary: [
    { kr: '유심', en: 'USIM / SIM card', rom: 'yusim' },
    { kr: '개통', en: 'activation', rom: 'gaetong' },
    { kr: '요금제', en: 'rate plan', rom: 'yogeumje' },
    { kr: '무약정', en: 'no commitment / no contract', rom: 'muakjeong' },
    { kr: '자동이체', en: 'automatic bank payment', rom: 'jadong iche' },
    { kr: '외국인 등록증', en: 'Alien Registration Card (ARC)', rom: 'oegugin deungnokjeung' },
    { kr: '개인정보 동의서', en: 'personal information consent form', rom: 'gaeinjungbo donguiseo' },
  ],
  completeTitle: '📱 유심 개통 완료!',
  completeMessage: '한국 휴대폰 번호가 생겼습니다!',
  images: ['images/telecom_arrive.webp', 'images/telecom_shop.webp', 'images/telecom_counter.webp'],
  sceneFn() {
    const scenes = {};
    const go = name => { clearChoices(); scenes[name](); };
    const enterGo = name => waitEnterThen(() => go(name));
    const bg = img => changeBackground('images/' + img);

    scenes.start = () => {
      bg('telecom_arrive.webp');
      typeText('주인공: 통신사 매장에 도착했다!\n유심을 개통해야 하는데... 직원에게 말을 걸어보자.', () => enterGo('greet'));
    };
    scenes.greet = () => {
      bg('telecom_shop.webp');
      typeText('통신사 직원: 안녕하세요! 무엇을 도와드릴까요?', () => {
        addChoice('유심 개통을 하러 왔습니다.', '1');
        addChoice('외국인도 유심 개통이 가능한가요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('askDocs'); else go('canForeigner'); });
    };
    scenes.canForeigner = () => {
      bg('telecom_shop.webp');
      typeText('통신사 직원: 네, 가능합니다!\n다만 90일 이상 체류하시는 분은 외국인 등록증이 필요해요.\n서류는 준비하셨나요?', () => {
        addChoice('네, 준비했습니다!', '1');
        addChoice('어떤 서류가 필요한가요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('checkId'); else go('listDocs'); });
    };
    scenes.askDocs = () => {
      bg('telecom_shop.webp');
      typeText('통신사 직원: 유심 개통이요! 서류는 준비하셨나요?', () => {
        addChoice('네, 준비했습니다!', '1');
        addChoice('어떤 서류가 필요한가요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('checkId'); else go('listDocs'); });
    };
    scenes.listDocs = () => {
      bg('telecom_shop.webp');
      typeText('통신사 직원: 필요한 서류를 안내해 드릴게요!\n\n📕 외국인 등록증 (필수)\n📘 여권 (필수)\n🏦 본인 명의 한국 은행 계좌 (자동이체용)\n\n⚠️ 90일 이상 체류 시 외국인 등록증 발급 후 가입 가능!', () => {
        addChoice('네, 다 준비했습니다!', '1');
        addChoice('은행 계좌가 꼭 필요한가요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('checkBank'); else go('whyBank'); });
    };
    scenes.whyBank = () => {
      bg('telecom_shop.webp');
      typeText('통신사 직원: 네, 매달 요금이 자동이체로 결제되기 때문에\n본인 명의의 한국 은행 계좌가 필요합니다.\n\n혹시 계좌가 있으세요?', () => {
        addChoice('네, 있습니다!', '1');
        addChoice('아직 없는데요...', '2');
      });
      waitForChoice(c => { if (c === '1') go('selectPlan'); else go('noBank'); });
    };
    scenes.noBank = () => {
      bg('telecom_shop.webp');
      typeText('통신사 직원: 은행 계좌가 없으시면 먼저 은행에서 통장을 개설하고 오셔야 해요.\n은행 통장 개설 후 다시 방문해 주세요!', () => {
        addChoice('알겠습니다. 은행 먼저 다녀올게요!', '1');
      });
      waitForChoice(() => go('failEnd'));
    };
    scenes.failEnd = () => {
      bg('telecom_shop.webp');
      typeText('주인공: 다음에 서류를 다 준비해서 다시 와야겠다!', showMissionComplete);
    };
    scenes.checkId = () => {
      bg('telecom_shop.webp');
      typeText('통신사 직원: 좋습니다! 외국인 등록증과 여권을 가져오셨나요?', () => {
        addChoice('네, 둘 다 가져왔습니다!', '1');
        addChoice('여권만 가져왔는데요...', '2');
      });
      waitForChoice(c => { if (c === '1') go('checkBank'); else go('noArc'); });
    };
    scenes.noArc = () => {
      bg('telecom_shop.webp');
      typeText('통신사 직원: 유심 개통에는 외국인 등록증이 꼭 필요해요.\n⚠️ 90일 이상 체류하시는 분은 외국인 등록증 발급 후 다시 방문해 주세요!', () => {
        addChoice('알겠습니다. 등록증 받고 다시 올게요!', '1');
      });
      waitForChoice(() => go('failEnd'));
    };
    scenes.checkBank = () => {
      bg('telecom_shop.webp');
      typeText('통신사 직원: 좋습니다! 그리고 본인 명의의 한국 은행 계좌도 있으세요?\n매달 요금 자동이체에 필요해요.', () => {
        addChoice('네, 있습니다!', '1');
        addChoice('아직 없는데요...', '2');
      });
      waitForChoice(c => { if (c === '1') go('selectPlan'); else go('noBank'); });
    };
    scenes.selectPlan = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 서류가 다 준비되셨네요!\n어떤 요금제를 원하세요?', () => {
        addChoice('📱 기본 요금제 (월 30,000원 / 3GB)', '1');
        addChoice('📱 중간 요금제 (월 50,000원 / 10GB)', '2');
        addChoice('📱 무제한 요금제 (월 70,000원 / 무제한)', '3');
      });
      waitForChoice(c => {
        if (c === '1') go('planBasic');
        else if (c === '2') go('planMid');
        else go('planUnlimited');
      });
    };
    scenes.planBasic = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 기본 요금제! 월 30,000원에 3GB 데이터예요.\n통화와 문자는 기본 제공됩니다.', () => enterGo('selectNumber'));
    };
    scenes.planMid = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 중간 요금제! 월 50,000원에 10GB 데이터예요.\n영상 통화도 편하게 쓸 수 있어요.', () => enterGo('selectNumber'));
    };
    scenes.planUnlimited = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 무제한 요금제! 월 70,000원에 데이터 무제한이에요.\n데이터 걱정 없이 쓸 수 있어요!', () => enterGo('selectNumber'));
    };
    scenes.selectNumber = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 전화번호를 선택해 주세요!', () => {
        addChoice('추천 번호로 해주세요.', '1');
        addChoice('직접 고르고 싶어요.', '2');
      });
      waitForChoice(c => { if (c === '1') go('recommendNumber'); else go('pickNumber'); });
    };
    scenes.recommendNumber = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 추천 번호는 010-XXXX-XXXX입니다.\n이 번호로 할까요?', () => {
        addChoice('네, 좋습니다!', '1');
        addChoice('다른 번호는 없나요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('submitDocs'); else go('otherNumbers'); });
    };
    scenes.otherNumbers = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 다른 번호도 있어요!\n\n① 010-YYYY-YYYY\n② 010-ZZZZ-ZZZZ\n\n어떤 번호로 하시겠어요?', () => {
        addChoice('첫 번째 번호로 할게요.', '1');
        addChoice('두 번째 번호로 할게요.', '2');
      });
      waitForChoice(() => go('submitDocs'));
    };
    scenes.pickNumber = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 여기 몇 가지 번호가 있어요.\n마음에 드는 번호를 골라주세요!', () => {
        addChoice('첫 번째 번호로 할게요.', '1');
        addChoice('두 번째 번호로 할게요.', '2');
      });
      waitForChoice(() => go('submitDocs'));
    };
    scenes.submitDocs = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 좋습니다! 그럼 서류를 확인할게요.\n외국인 등록증과 여권을 제출해 주세요.', () => {
        addChoice('(서류를 건넨다)', '1');
        addChoice('네, 여기 있습니다!', '2');
      });
      waitForChoice(() => go('verifyDocs'));
    };
    scenes.verifyDocs = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: (서류를 확인한다)\n📕 외국인 등록증... ✅\n📘 여권... ✅\n🏦 은행 계좌 확인... ✅', () => enterGo('verifyStay'));
    };
    scenes.verifyStay = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 체류 기간을 확인할게요...\n90일 이상 체류 확인! ✅\n\n모든 조건이 충족되었습니다!', () => enterGo('privacyConsent'));
    };
    scenes.privacyConsent = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 개통 전에 몇 가지 서류에 서명이 필요합니다.\n\n📋 개인정보 수집·이용 동의서\n• 수집 항목: 성명, 외국인등록번호, 연락처, 주소\n• 이용 목적: 통신 서비스 제공 및 요금 청구\n• 보유 기간: 서비스 해지 후 5년', () => {
        addChoice('(동의서를 읽고 서명한다) ✍️', '1');
        addChoice('내용을 좀 더 자세히 볼 수 있나요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('contract'); else go('privacyDetail'); });
    };
    scenes.privacyDetail = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 물론이죠! 천천히 읽어보세요.\n📋 개인정보는 통신 서비스 제공, 요금 청구, 고객 상담 목적으로만 사용됩니다.\n제3자 제공 시 별도 동의를 받습니다.\n확인하셨으면 서명해 주세요.', () => {
        addChoice('(동의서에 서명한다) ✍️', '1');
      });
      waitForChoice(() => go('contract'));
    };
    scenes.contract = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 개인정보 동의서 서명 완료! ✅\n다음은 통신사 가입 계약서입니다.\n\n📋 통신 서비스 가입 계약서\n• 무약정 — 언제든 해지 가능, 위약금 없음\n• 결제 방법: 은행 자동이체', () => {
        addChoice('(계약서를 읽고 서명한다) ✍️', '1');
        addChoice('약정이 정말 없는 건가요?', '2');
      });
      waitForChoice(c => { if (c === '1') go('contractDone'); else go('noCommitment'); });
    };
    scenes.noCommitment = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 네, 무약정이라 언제든 해지 가능하고\n위약금도 없습니다! 안심하세요. 😊\n\n확인하셨으면 서명해 주세요.', () => {
        addChoice('(계약서에 서명한다) ✍️', '1');
      });
      waitForChoice(() => go('contractDone'));
    };
    scenes.contractDone = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 가입 계약서 서명 완료! ✅\n\n모든 서류 작성이 끝났습니다! 📝', () => enterGo('registerBank'));
    };
    scenes.registerBank = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 자동이체 계좌를 등록할게요.\n은행 계좌 정보를 알려주세요.', () => {
        addChoice('(계좌 정보를 알려준다)', '1');
        addChoice('(통장을 보여준다)', '2');
      });
      waitForChoice(() => go('bankDone'));
    };
    scenes.bankDone = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 자동이체 등록 완료! ✅\n\n이제 유심을 장착해 드릴게요.\n(유심을 꺼내 휴대폰에 장착한다)', () => enterGo('installing'));
    };
    scenes.installing = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 유심 장착 완료! 📱\n개통 처리 중입니다... 잠시만 기다려 주세요.', () => enterGo('testCall'));
    };
    scenes.testCall = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 개통이 완료되었습니다! 🎉\n\n새 전화번호로 테스트 전화를 해볼까요?', () => {
        addChoice('네, 테스트해 주세요!', '1');
        addChoice('괜찮아요, 나중에 해볼게요.', '2');
      });
      waitForChoice(c => { if (c === '1') go('testResult'); else go('skipTest'); });
    };
    scenes.testResult = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: (테스트 전화를 건다)\n📞 따르르릉~\n\n잘 되네요! 정상적으로 개통되었습니다!', () => enterGo('complete'));
    };
    scenes.skipTest = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 알겠습니다! 정상적으로 개통되었으니 안심하세요.', () => enterGo('complete'));
    };
    scenes.complete = () => {
      bg('telecom_counter.webp');
      typeText('통신사 직원: 유심 개통이 완료되었습니다! 수고하셨어요!\n주인공: 감사합니다! 이제 한국에서 전화할 수 있겠네요!', showMissionComplete);
    };

    go('start');
  }
};
