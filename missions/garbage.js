const garbageMission = {
  id: 'garbage',
  title: '쓰레기 봉투 구매',
  background: 'images/ConvStoreInside.png',
  vocabulary: [
    { kr: '종량제 봉투', en: 'designated garbage bag (for general trash)', rom: 'jongnyangjae bong-tu' },
    { kr: '음식물 쓰레기', en: 'food waste', rom: 'eumsikmal sseurejii' },
    { kr: '분리수거', en: 'separate waste collection', rom: 'bulli-sugeo' },
    { kr: '재활용', en: 'recycling', rom: 'jaehwalyong' },
    { kr: '과태료', en: 'administrative fine (penalty)', rom: 'gwataelyo' },
  ],
  helperContext: `The player is buying Korean garbage bags at a convenience store (편의점).
Korea's three-category waste system:
1. 종량제 봉투 (designated bag): for non-recyclable general trash — tissues, snack wrappers, broken dishes, etc.
2. 음식물 쓰레기 봉투: for food waste — leftovers, peels, vegetable scraps. NOT bones, shells, or seeds (those go in the general bag). Must drain liquid first.
3. Recyclables (재활용): paper, plastic, cans, glass — NO bag needed; put clean items in the designated recycling bins.
Trash must be put out at designated times (usually 7 pm–midnight) and locations. Violations = 과태료 (fines).`,
  completeTitle: '봉투 구매 완료! 🗑️',
  completeMessage: '올바른 쓰레기 봉투를 구매했습니다!',
  images: ['images/ConvStoreInside.png'],
  sceneFn() {
    const scenes = {};
    const go = name => { clearChoices(); scenes[name](); };
    const enterGo = name => waitEnterThen(() => go(name));
    const bg = img => changeBackground('images/' + img);

    let bagType = '';

    scenes.start = () => {
      bg('ConvStoreInside.png');
      typeText('주인공: 쓰레기를 버려야 하는데...\n쓰레기 봉투가 필요하다. 편의점에 가보자!', () => enterGo('greet'));
    };

    scenes.greet = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 안녕하세요! 뭐 찾으세요?', () => {
        addChoice('쓰레기 봉투 주세요!', '1');
        addChoice('쓰레기를 버리려고 하는데요...', '2');
        waitForChoice(() => go('askWhich'));
      });
    };

    scenes.askWhich = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 쓰레기 봉투요! 어떤 종류가 필요하세요?\n종류가 여러 가지 있거든요.', () => {
        addChoice('종류가 있어요? 잘 모르겠는데요...', '1');
        addChoice('어떤 종류가 있나요?', '2');
        waitForChoice(() => go('explainGeneral'));
      });
    };

    // ===== Explanation of waste categories =====
    scenes.explainGeneral = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 한국에서는 쓰레기를 분리해서 버려야 해요!\n봉투 종류를 하나씩 설명해 드릴게요.', () => enterGo('explainJongyang'));
    };

    scenes.explainJongyang = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 첫 번째, 종량제 봉투예요!\n\n🗑️ 종량제 봉투 (일반 쓰레기):\n• 재활용이 안 되는 일반 쓰레기를 넣어요\n• 예: 휴지, 과자 봉지, 깨진 그릇, 먼지 등\n• 크기별로 가격이 달라요 (10L, 20L, 50L 등)', () => enterGo('explainFood'));
    };

    scenes.explainFood = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 두 번째, 음식물 쓰레기 봉투예요!\n\n🍎 음식물 쓰레기 봉투:\n• 먹다 남은 음식, 과일 껍질, 채소 찌꺼기 등\n• 뼈, 조개껍데기, 씨앗은 일반 쓰레기예요!\n• 물기를 빼고 넣어야 해요', () => enterGo('explainRecycle'));
    };

    scenes.explainRecycle = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 세 번째, 재활용이에요!\n\n♻️ 재활용:\n• 종이, 플라스틱, 캔, 유리, 비닐 등\n• 재활용은 봉투가 따로 필요 없어요!\n• 깨끗이 씻어서 분리수거함에 넣으면 돼요', () => enterGo('askTrash'));
    };

    // ===== Identify what the player has =====
    scenes.askTrash = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 이제 어떤 쓰레기를 버리실 건지 알려주세요!\n그러면 맞는 봉투를 찾아드릴게요.', () => {
        addChoice('먹다 남은 음식이랑 과일 껍질이요.', '1');
        addChoice('휴지랑 과자 봉지, 깨진 컵이요.', '2');
        addChoice('플라스틱 병이랑 종이 박스요.', '3');
        addChoice('여러 가지가 섞여 있어요...', '4');
        waitForChoice(c => {
          if (c === '1') go('resultFood');
          else if (c === '2') go('resultGeneral');
          else if (c === '3') go('resultRecycle');
          else go('resultMixed');
        });
      });
    };

    scenes.resultFood = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 음식물 쓰레기 봉투가 필요해요! 🍎\n\n⚠️ 참고: 물기를 꼭 빼고 넣으세요!\n뼈나 조개껍데기는 일반 쓰레기예요.', () => {
        addChoice('음식물 쓰레기 봉투 주세요!', '1');
        waitForChoice(() => { bagType = 'food'; go('askSize'); });
      });
    };

    scenes.resultGeneral = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 종량제 봉투(일반 쓰레기)가 필요해요! 🗑️\n\n이런 것들은 재활용이 안 되니까\n종량제 봉투에 넣어서 버리시면 돼요.', () => {
        addChoice('종량제 봉투 주세요!', '1');
        waitForChoice(() => { bagType = 'general'; go('askSize'); });
      });
    };

    scenes.resultRecycle = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 플라스틱 병이랑 종이 박스요?\n그건 재활용이에요! ♻️\n\n재활용은 봉투가 필요 없어요!\n깨끗이 씻어서 아파트 분리수거함에 넣으시면 됩니다.', () => {
        addChoice('아, 봉투가 필요 없군요!', '1');
        addChoice('그럼 다른 쓰레기도 있는데요...', '2');
        waitForChoice(c => {
          if (c === '1') go('recycleOnly');
          else go('askTrashMore');
        });
      });
    };

    scenes.recycleOnly = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 재활용은 분리수거함에 넣으시면 돼요.\n\n💡 분리 방법:\n• 플라스틱: 라벨 떼고, 씻어서\n• 종이: 접어서\n• 캔: 씻어서\n• 유리: 색깔별로 분리', () => enterGo('askMore'));
    };

    scenes.askMore = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 혹시 다른 쓰레기도 있으세요?', () => {
        addChoice('네, 일반 쓰레기도 있어요.', '1');
        addChoice('네, 음식물 쓰레기도 있어요.', '2');
        addChoice('아니요, 재활용만 있어요!', '3');
        waitForChoice(c => {
          if (c === '1') { bagType = 'general'; go('askSize'); }
          else if (c === '2') { bagType = 'food'; go('askSize'); }
          else go('completeRecycleOnly');
        });
      });
    };

    scenes.completeRecycleOnly = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 그럼 봉투는 필요 없으시네요!\n분리수거함에 잘 넣어주세요. 😊\n\n주인공: 감사합니다! 한국의 분리수거를 배웠어요!', showMissionComplete);
    };

    scenes.resultMixed = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 여러 가지가 섞여 있으면 분리해서 버려야 해요!\n\n어떤 것들이 있는지 하나씩 알려주세요.', () => {
        addChoice('음식 찌꺼기 + 휴지 + 플라스틱 병', '1');
        addChoice('과일 껍질 + 과자 봉지 + 캔', '2');
        waitForChoice(() => go('mixedExplain'));
      });
    };

    scenes.mixedExplain = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 이렇게 분리하시면 돼요!\n\n🍎 음식물 → 음식물 쓰레기 봉투\n🗑️ 휴지/과자봉지 → 종량제 봉투\n♻️ 플라스틱/캔 → 분리수거함 (봉투 불필요)\n\n봉투 두 종류가 필요하시네요!', () => {
        addChoice('음식물 봉투 + 종량제 봉투 둘 다 주세요!', '1');
        waitForChoice(() => { bagType = 'both'; go('askSize'); });
      });
    };

    scenes.askTrashMore = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 다른 쓰레기도 있으시군요!\n어떤 쓰레기가 더 있으세요?', () => {
        addChoice('휴지랑 과자 봉지도 있어요.', '1');
        addChoice('음식 찌꺼기도 있어요.', '2');
        waitForChoice(c => {
          if (c === '1') { bagType = 'general'; go('askSize'); }
          else { bagType = 'food'; go('askSize'); }
        });
      });
    };

    // ===== Size & purchase =====
    scenes.askSize = () => {
      bg('ConvStoreInside.png');
      if (bagType === 'food') {
        typeText('편의점 사장: 음식물 쓰레기 봉투 크기를 선택해 주세요!', () => {
          addChoice('2L (소) - 1~2인 가구', '1');
          addChoice('5L (중) - 3~4인 가구', '2');
          addChoice('10L (대) - 많은 양', '3');
          waitForChoice(() => go('askQuantity'));
        });
      } else {
        typeText('편의점 사장: 종량제 봉투 크기를 선택해 주세요!', () => {
          addChoice('10L (소) - 작은 양', '1');
          addChoice('20L (중) - 보통', '2');
          addChoice('50L (대) - 많은 양', '3');
          waitForChoice(() => go('askQuantity'));
        });
      }
    };

    scenes.askQuantity = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 몇 장 드릴까요?', () => {
        addChoice('1장만 주세요.', '1');
        addChoice('5장 묶음으로 주세요.', '2');
        addChoice('10장 묶음으로 주세요.', '3');
        waitForChoice(() => go('payment'));
      });
    };

    scenes.payment = () => {
      bg('ConvStoreInside.png');
      let price = '';
      if (bagType === 'both') price = '종량제 봉투 + 음식물 봉투 합해서\n총 2,500원입니다!';
      else if (bagType === 'food') price = '음식물 쓰레기 봉투\n총 500원입니다!';
      else price = '종량제 봉투\n총 1,200원입니다!';
      typeText(`편의점 사장: ${price}`, () => {
        addChoice('(결제한다)', '1');
        waitForChoice(() => go('payDone'));
      });
    };

    scenes.payDone = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 결제 완료! ✅\n여기 봉투요!', () => enterGo('tips'));
    };

    scenes.tips = () => {
      bg('ConvStoreInside.png');
      typeText('편의점 사장: 참, 쓰레기 버리실 때 팁이에요!\n\n⏰ 쓰레기 배출 시간: 보통 저녁 7시~밤 12시\n📍 배출 장소: 아파트 분리수거장 또는 지정 장소\n⚠️ 시간/장소를 안 지키면 과태료가 나올 수 있어요!', () => {
        addChoice('알겠습니다! 감사합니다!', '1');
        addChoice('배출 시간이 정해져 있군요!', '2');
        waitForChoice(() => go('missionEnd'));
      });
    };

    scenes.missionEnd = () => {
      bg('ConvStoreInside.png');
      let msg = '주인공: 한국의 쓰레기 분리 방법을 배웠다!\n\n';
      msg += '💡 요약:\n';
      msg += '• 🗑️ 종량제 봉투: 일반 쓰레기 (휴지, 과자봉지 등)\n';
      msg += '• 🍎 음식물 봉투: 음식 찌꺼기 (물기 빼기!)\n';
      msg += '• ♻️ 재활용: 봉투 불필요 (분리수거함에)\n';
      msg += '• ⏰ 배출 시간을 꼭 지키세요!';
      typeText(msg, showMissionComplete);
    };

    go('start');
  }
};
