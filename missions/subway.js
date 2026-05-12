const subwayMission = {
  id: 'subway',
  title: '지하철 — Seoul Subway',
  background: 'images/subway_entrance.webp',
  helperContext: `The player is learning to ride the Seoul subway with a Korean friend, heading to Seoul Station (서울역).
Key concepts: 교통카드 (T-money card) used at the 개찰구 (turnstile/gate); 승강장 (platform).
Important cultural rule: 노약자석 (priority seat for elderly/disabled) and 임산부 배려석 (pink maternity seat)
must always be left empty, even when the train is full — sitting there is considered rude in Korea.
When boarding, always let passengers exit first before getting on.`,
  vocabulary: [
    { kr: '지하철', en: 'subway / metro', rom: 'jihacheol' },
    { kr: '교통카드', en: 'transit card (T-money)', rom: 'gyotong kada' },
    { kr: '개찰구', en: 'ticket gate / turnstile', rom: 'gaechalgu' },
    { kr: '승강장', en: 'platform', rom: 'seunggangjang' },
    { kr: '노약자석', en: 'priority seat (elderly/disabled)', rom: 'noyakjaseok' },
    { kr: '임산부 배려석', en: 'maternity seat (pink)', rom: 'imsanbu baeryeoseok' },
    { kr: '안전선', en: 'safety line', rom: 'anjeonson' },
  ],
  completeTitle: '🚇 서울역 도착!',
  completeMessage: '지하철 에티켓을 배웠습니다!',
  images: [
    'images/subway_entrance.webp', 'images/subway_card.webp', 'images/subway_card_friend.webp',
    'images/subway_platform.webp', 'images/subway_inside_00.webp', 'images/subway_inside_01.webp',
    'images/subway_arrive.webp',
  ],
  sceneFn() {
    const scenes = {};
    const go = name => { clearChoices(); scenes[name](); };
    const enterGo = name => waitEnterThen(() => go(name));

    const bg = img => {
      changeBackground('images/' + img);
    };

    scenes.start = () => {
      bg('subway_entrance.webp');
      typeText('주인공: 드디어 지하철역에 도착했다!\n친구: 여기서 지하철 타고 서울역으로 가자!', () => enterGo('goGate'));
    };
    scenes.goGate = () => {
      bg('subway_entrance.webp');
      typeText('친구: 먼저 개찰구에서 교통 카드를 찍어야 해.\n저기 단말기가 보이지?', () => {
        addChoice('(단말기로 간다)', '1');
        addChoice('어디에 찍으면 돼?', '2');
      });
      waitForChoice(c => { if (c === '1') go('tapCard'); else go('whereToTap'); });
    };
    scenes.whereToTap = () => {
      bg('subway_card.webp');
      typeText('친구: 저기 파란색 단말기 있지? 거기에 카드를 대면 돼!', () => addChoice('(단말기로 간다)', '1'));
      waitForChoice(() => go('tapCard'));
    };
    scenes.tapCard = () => {
      bg('subway_card.webp');
      typeText('(교통 카드를 단말기에 찍는다)\n📢 삐빅! ✅\n\n주인공: 오, 통과됐다!', () => enterGo('friendTap'));
    };
    scenes.friendTap = () => {
      bg('subway_card_friend.webp');
      typeText('(친구도 카드를 찍고 통과한다)\n친구: 좋아! 이제 아래로 내려가자.', () => {
        addChoice('(계단으로 내려간다)', '1');
        addChoice('(에스컬레이터를 탄다)', '2');
      });
      waitForChoice(() => go('goDown'));
    };
    scenes.goDown = () => {
      bg('subway_platform.webp');
      typeText('(승강장에 도착했다)\n친구: 여기서 기다리면 돼. 서울역 방면 열차가 곧 올 거야.', () => enterGo('waiting'));
    };
    scenes.waiting = () => {
      bg('subway_platform.webp');
      typeText('(승강장에서 기다리는 중...)\n\n주인공: 사람이 꽤 많네.', () => {
        addChoice('(조용히 기다린다)', '1');
        addChoice('몇 정거장이야?', '2');
      });
      waitForChoice(c => { if (c === '1') go('trainComing'); else go('howManyStops'); });
    };
    scenes.howManyStops = () => {
      bg('subway_platform.webp');
      typeText('친구: 여기서 서울역까지 3정거장이야.\n금방 도착할 거야!', () => enterGo('trainComing'));
    };
    scenes.trainComing = () => {
      bg('subway_platform.webp');
      typeText('📢 "잠시 후 열차가 도착합니다. 안전선 뒤로 물러서 주세요."\n\n(열차가 들어오고 있다...)', () => enterGo('trainArrived'));
    };
    scenes.trainArrived = () => {
      bg('subway_platform.webp');
      typeText('(열차가 도착하고 문이 열린다)\n친구: 타자!', () => {
        addChoice('(열차에 탄다)', '1');
        addChoice('(사람들이 내리길 기다린 후 탄다)', '2');
      });
      waitForChoice(c => { if (c === '2') go('politeBoard'); else go('boardTrain'); });
    };
    scenes.politeBoard = () => {
      bg('subway_inside_00.webp');
      typeText('(열차에 탔다)\n\n친구: 잘했어! 내리는 사람 먼저 보내고 타는 게 예의야.', () => enterGo('noSeats'));
    };
    scenes.boardTrain = () => {
      bg('subway_inside_00.webp');
      typeText('(열차에 탔다)\n친구: 참, 다음부터는 내리는 사람 먼저 보내고 타는 게 좋아!', () => enterGo('noSeats'));
    };
    scenes.noSeats = () => {
      bg('subway_inside_00.webp');
      typeText('(차 안을 둘러본다... 빈 자리가 없다)\n\n주인공: 자리가 하나도 없네...', () => enterGo('seeSpecialSeat'));
    };
    scenes.seeSpecialSeat = () => {
      bg('subway_inside_00.webp');
      typeText('(그때, 저쪽에 빈 좌석이 보인다)\n\n주인공: 어? 저기 빈 자리가 있다! 저기 앉자!', () => {
        addChoice('저기 앉으러 가자!', '1');
        addChoice('(자리를 가리킨다)', '2');
      });
      waitForChoice(() => go('friendStops'));
    };
    scenes.friendStops = () => {
      bg('subway_inside_00.webp');
      typeText('친구: 잠깐! 거기 앉으면 안 돼!', () => {
        addChoice('왜? 빈 자리잖아.', '1');
        addChoice('뭐가 문제야?', '2');
      });
      waitForChoice(() => go('explain'));
    };
    scenes.explain = () => {
      bg('subway_inside_00.webp');
      typeText('친구: 저 자리는 "노약자 좌석"이야.\n어르신, 장애인, 임산부를 위해 비워 두는 자리야.\n\n옆에 분홍색 자리는 "임산부 배려석"이고,\n임산부를 위해 항상 비워 둬야 해.', () => enterGo('explainMore'));
    };
    scenes.explainMore = () => {
      bg('subway_inside_00.webp');
      typeText('친구: 한국에서는 자리가 비어 있어도\n노약자석과 임산부석에는 앉지 않는 게 예의야.\n\n만약 어르신이나 임산부가 오시면\n일반 좌석에 앉아 있더라도 양보하는 게 좋아!', () => {
        addChoice('아, 그렇구나! 몰랐어.', '1');
        addChoice('우리나라에는 없는 문화야. 좋은 거 배웠다!', '2');
      });
      waitForChoice(() => go('understood'));
    };
    scenes.understood = () => {
      bg('subway_inside_00.webp');
      typeText('주인공: 고마워! 알려줘서 다행이다.\n앞으로는 노약자석에 앉지 않을게.\n\n친구: 👍 그래, 서서 가자!', () => enterGo('riding'));
    };
    scenes.riding = () => {
      bg('subway_inside_01.webp');
      typeText('(서서 가는 중... 창밖으로 풍경이 지나간다)\n\n📢 "다음 역은 서울역, 서울역입니다."', () => enterGo('arriving'));
    };
    scenes.arriving = () => {
      bg('subway_inside_01.webp');
      typeText('📢 "이번 역은 서울역입니다.\n내리실 문은 오른쪽입니다."\n\n친구: 우리 내릴 차례야!', () => {
        addChoice('(문 쪽으로 이동한다)', '1');
        addChoice('(내릴 준비를 한다)', '2');
      });
      waitForChoice(() => go('getOff'));
    };
    scenes.getOff = () => {
      bg('subway_arrive.webp');
      typeText('(열차에서 내린다)\n\n주인공: 도착이다! 서울역!\n친구: 수고했어!', () => enterGo('finalAdvice'));
    };
    scenes.finalAdvice = () => {
      bg('subway_arrive.webp');
      typeText('친구: 아 참, 다음에 지하철 탈 때도 기억해!\n\n🔹 노약자 좌석 — 어르신, 장애인을 위한 자리\n🔸 임산부 배려석 — 임산부를 위한 자리\n\n비어 있어도 앉지 않는 게 한국의 에티켓이야!', () => {
        addChoice('알겠어! 꼭 기억할게!', '1');
        addChoice('좋은 거 배웠다. 고마워!', '2');
      });
      waitForChoice(() => go('complete'));
    };
    scenes.complete = () => {
      bg('subway_arrive.webp');
      typeText('주인공: 오늘 정말 좋은 거 배웠다!\n한국 지하철 에티켓, 꼭 기억할게!\n\n친구: 그래! 이제 서울역 구경하러 가자! 😊', showMissionComplete);
    };

    go('start');
  }
};
